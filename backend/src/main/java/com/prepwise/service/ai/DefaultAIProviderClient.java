package com.prepwise.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prepwise.entity.AIRequest;
import com.prepwise.entity.User;
import com.prepwise.exception.AIProviderUnavailableException;
import com.prepwise.exception.AIQuotaExceededException;
import com.prepwise.repository.AIRequestRepository;
import com.prepwise.repository.UserRepository;
import com.prepwise.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@Primary
@RequiredArgsConstructor
public class DefaultAIProviderClient implements AIProviderClient {

    private final AIRequestRepository aiRequestRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Value("${ai.provider:${AI_PROVIDER:groq}}")
    private String provider;

    @Value("${ai.api-key:${GROQ_API_KEY:${AI_API_KEY:}}}")
    private String apiKey;

    @Value("${GROQ_API_KEY:}")
    private String groqApiKeyFallback;

    @Value("${ai.model:${GROQ_MODEL:${AI_MODEL:qwen/qwen3.6-27b}}}")
    private String model;

    @Value("${ai.fallback-model:${AI_FALLBACK_MODEL:qwen/qwen3.8-27b}}")
    private String fallbackModel;

    @Value("${ai.max-tokens:${AI_MAX_TOKENS:1000}}")
    private int maxTokens;

    @Value("${ai.api-base-url:${AI_SERVICE_URL:${AI_API_BASE_URL:https://api.groq.com/openai/v1}}}")
    private String apiBaseUrl;

    @Value("${ai.timeout-seconds:${AI_TIMEOUT_SECONDS:30}}")
    private int timeoutSeconds;

    private static final java.util.regex.Pattern RETRY_IN_PATTERN =
            java.util.regex.Pattern.compile("(?:retry|try again|please wait)?\\s*(?:in)?\\s*([0-9]+(?:\\.[0-9]+)?)\\s*s(?:econds?)?", java.util.regex.Pattern.CASE_INSENSITIVE);

    @Override
    public String complete(String systemPrompt, String userPrompt) {
        return complete(systemPrompt, userPrompt, "GENERAL", null);
    }

    @Override
    public String complete(String systemPrompt, String userPrompt, String feature) {
        return complete(systemPrompt, userPrompt, feature, null);
    }

    @Override
    public String complete(String systemPrompt, String userPrompt, String feature, User user) {
        User targetUser = user;
        if (targetUser == null) {
            targetUser = getCurrentUser();
        }

        int tokenEstimate = calculateTokenEstimate(systemPrompt, userPrompt);
        String status = "SUCCESS";
        String responseText = null;

        try {
            responseText = executeWithRetry(systemPrompt, userPrompt);
            if (responseText != null) {
                tokenEstimate += responseText.length() / 4;
            }
            return responseText;
        } catch (AIQuotaExceededException e) {
            status = "FAILED_QUOTA";
            throw e;
        } catch (AIProviderUnavailableException e) {
            status = "FAILED_UNAVAILABLE";
            throw e;
        } catch (Exception e) {
            status = "FAILED";
            throw new AIProviderUnavailableException("AI Service Temporarily Unavailable — Please try again in a few moments.", e);
        } finally {
            logAIRequest(targetUser, feature, tokenEstimate, status);
        }
    }

    private String executeWithRetry(String systemPrompt, String userPrompt) {
        String effectiveKey = getEffectiveApiKey();

        // 1. Try primary model with retries
        try {
            return executeModelAttempts(systemPrompt, userPrompt, effectiveKey, model);
        } catch (AIQuotaExceededException e) {
            if (fallbackModel != null && !fallbackModel.isBlank() && !fallbackModel.equalsIgnoreCase(model)) {
                log.warn("Primary model {} quota exceeded/rate limited. Attempting fallback model {}", model, fallbackModel);
                try {
                    return executeModelAttempts(systemPrompt, userPrompt, effectiveKey, fallbackModel);
                } catch (Exception fallbackEx) {
                    log.error("Fallback model {} call failed: {}", fallbackModel, fallbackEx.getMessage());
                }
            }
            throw e;
        }
    }

    private String executeModelAttempts(String systemPrompt, String userPrompt, String effectiveKey, String targetModel) {
        int maxRetries = 3;
        long waitTimeMs = 1000;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return sendApiCall(systemPrompt, userPrompt, effectiveKey, targetModel);
            } catch (AIQuotaExceededException e) {
                Integer retryDelaySec = e.getRetryDelaySeconds();
                if (retryDelaySec != null && retryDelaySec > 10) {
                    // Retry delay is long (e.g. >10s). Avoid hammering API; fail fast for fallback/exception handler.
                    log.warn("Model {} 429 rate limit requires long retry delay ({}s). Stopping attempts for this model.", targetModel, retryDelaySec);
                    throw e;
                }

                if (attempt < maxRetries) {
                    long delayToSleepMs = (retryDelaySec != null && retryDelaySec <= 5) ? (retryDelaySec * 1000L) : waitTimeMs;
                    log.warn("Model {} Rate limit hit (429). Retrying attempt {}/{} in {} ms...", targetModel, attempt, maxRetries, delayToSleepMs);
                    try {
                        Thread.sleep(delayToSleepMs);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw e;
                    }
                    waitTimeMs *= 2;
                } else {
                    log.error("Model {} Rate limit persistent after {} attempts.", targetModel, maxRetries);
                    throw e;
                }
            } catch (AIProviderUnavailableException e) {
                // If model is unavailable (404) or auth failed (401/403), do not retry — fail immediately
                if (e.getMessage() != null && (e.getMessage().contains("unavailable") || e.getMessage().contains("authentication failed") || e.getMessage().contains("missing"))) {
                    log.error("AI Provider non-retryable error for model {}: {}", targetModel, e.getMessage());
                    throw e;
                }
                if (attempt < maxRetries) {
                    log.warn("AI Provider error (Attempt {}/{}). Retrying in {} ms...", attempt, maxRetries, waitTimeMs);
                    try { Thread.sleep(waitTimeMs); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); throw e; }
                    waitTimeMs *= 2;
                } else {
                    log.error("AI Provider unavailable after {} attempts: {}", maxRetries, e.getMessage());
                    throw e;
                }
            } catch (Exception e) {
                if (attempt < maxRetries) {
                    log.warn("Transient error during AI call (Attempt {}/{}): {}. Retrying in {} ms...", attempt, maxRetries, e.getMessage(), waitTimeMs);
                    try { Thread.sleep(waitTimeMs); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); throw new AIProviderUnavailableException("Interrupted during AI retry wait", ie); }
                    waitTimeMs *= 2;
                } else {
                    log.error("AI call failed after {} attempts: {}", maxRetries, e.getMessage());
                    throw new AIProviderUnavailableException(e.getMessage() != null ? e.getMessage() : "AI Service Temporarily Unavailable — Please try again in a few moments.", e);
                }
            }
        }
        throw new AIProviderUnavailableException("AI Service Temporarily Unavailable for model: " + targetModel);
    }

    private String sendApiCall(String systemPrompt, String userPrompt, String effectiveKey, String targetModel) throws Exception {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(timeoutSeconds))
                .build();

        boolean isGemini = provider.equalsIgnoreCase("gemini")
                || apiBaseUrl.contains("generativelanguage.googleapis.com");

        HttpRequest request;
        if (isGemini) {
            String url = apiBaseUrl.replaceAll("/+$", "") + "/v1beta/models/" + targetModel + ":generateContent?key=" + effectiveKey;

            Map<String, Object> bodyMap = new HashMap<>();
            if (systemPrompt != null && !systemPrompt.isBlank()) {
                bodyMap.put("systemInstruction", Map.of(
                        "parts", List.of(Map.of("text", systemPrompt))
                ));
            }
            List<Map<String, Object>> contents = new ArrayList<>();
            contents.add(Map.of("role", "user", "parts", List.of(Map.of("text", userPrompt != null ? userPrompt : ""))));
            bodyMap.put("contents", contents);

            String jsonPayload = objectMapper.writeValueAsString(bodyMap);

            request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .header("User-Agent", "PrepWise-Backend/1.0")
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();
        } else {
            String baseUrlClean = apiBaseUrl.replaceAll("/+$", "");
            String endpoint;
            if (baseUrlClean.endsWith("/chat/completions")) {
                endpoint = baseUrlClean;
            } else if (baseUrlClean.endsWith("/v1")) {
                endpoint = baseUrlClean + "/chat/completions";
            } else {
                endpoint = baseUrlClean + "/v1/chat/completions";
            }

            Map<String, Object> bodyMap = new HashMap<>();
            bodyMap.put("model", targetModel);
            if (maxTokens > 0) {
                bodyMap.put("max_tokens", maxTokens);
            }
            List<Map<String, String>> messages = new ArrayList<>();
            if (systemPrompt != null && !systemPrompt.isBlank()) {
                messages.add(Map.of("role", "system", "content", systemPrompt));
            }
            messages.add(Map.of("role", "user", "content", userPrompt != null ? userPrompt : ""));
            bodyMap.put("messages", messages);

            String jsonPayload = objectMapper.writeValueAsString(bodyMap);

            request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + effectiveKey)
                    .header("User-Agent", "PrepWise-Backend/1.0")
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();
        }

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        int statusCode = response.statusCode();
        if (statusCode == 429) {
            Integer retryDelaySec = parseRetryDelaySeconds(response);
            log.warn("Groq API Rate Limit hit (HTTP 429) for model {}. Body: {}. Parsed retryDelay: {}s", targetModel, response.body(), retryDelaySec);
            String msg = (retryDelaySec != null && retryDelaySec > 0)
                    ? "Groq API rate limit exceeded. Please try again in " + retryDelaySec + " seconds."
                    : "Groq API rate limit exceeded. Please try again shortly.";
            throw new AIQuotaExceededException(msg, retryDelaySec);
        }
        if (statusCode == 404) {
            log.error("Groq Model Not Found (HTTP 404) for model {}. Body: {}", targetModel, response.body());
            throw new AIProviderUnavailableException("Configured Groq model is unavailable: " + targetModel);
        }
        if (statusCode == 401 || statusCode == 403) {
            log.error("Groq API Auth Error (HTTP {}). Body: {}", statusCode, response.body());
            throw new AIProviderUnavailableException("Groq API authentication failed. Please check GROQ_API_KEY.");
        }
        if (statusCode >= 400) {
            log.error("Groq API Error (HTTP {}). Body: {}", statusCode, response.body());
            throw new AIProviderUnavailableException("Groq API request failed with HTTP " + statusCode + ": " + response.body());
        }

        JsonNode rootNode = objectMapper.readTree(response.body());
        String contentText;
        if (isGemini) {
            JsonNode textNode = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text");
            if (textNode.isMissingNode() || textNode.isNull()) {
                throw new AIProviderUnavailableException("Invalid response format from Gemini AI provider.");
            }
            contentText = textNode.asText();
        } else {
            JsonNode choicesNode = rootNode.path("choices");
            if (!choicesNode.isArray() || choicesNode.isEmpty()) {
                throw new AIProviderUnavailableException("Invalid response format from Groq AI provider.");
            }
            JsonNode textNode = choicesNode.get(0).path("message").path("content");
            if (textNode.isMissingNode() || textNode.isNull()) {
                throw new AIProviderUnavailableException("Invalid response format from Groq AI provider.");
            }
            contentText = textNode.asText();
        }

        return stripThinkTags(contentText);
    }

    private String stripThinkTags(String text) {
        if (text == null) return null;
        if (text.contains("</think>")) {
            int idx = text.lastIndexOf("</think>");
            String clean = text.substring(idx + "</think>".length()).trim();
            return clean.isEmpty() ? text : clean;
        }
        return text;
    }

    private Integer parseRetryDelaySeconds(HttpResponse<String> response) {
        if (response == null) return null;

        // 1. Check HTTP header Retry-After
        Optional<String> retryAfterHeader = response.headers().firstValue("Retry-After");
        if (retryAfterHeader.isPresent()) {
            try {
                return Integer.parseInt(retryAfterHeader.get().trim());
            } catch (NumberFormatException ignored) {}
        }

        // 2. Check x-ratelimit-reset header if present
        Optional<String> resetHeader = response.headers().firstValue("x-ratelimit-reset-requests");
        if (resetHeader.isEmpty()) {
            resetHeader = response.headers().firstValue("x-ratelimit-reset-tokens");
        }
        if (resetHeader.isPresent()) {
            try {
                String val = resetHeader.get().trim();
                if (val.matches("^[0-9]+(?:\\.[0-9]+)?s?$")) {
                    double s = Double.parseDouble(val.replaceAll("[^0-9.]", ""));
                    return (int) Math.ceil(s);
                }
            } catch (Exception ignored) {}
        }

        String body = response.body();
        if (body == null || body.isBlank()) return null;

        try {
            JsonNode root = objectMapper.readTree(body);
            JsonNode detailsNode = root.path("error").path("details");
            if (detailsNode.isArray()) {
                for (JsonNode detail : detailsNode) {
                    if (detail.path("@type").asText("").contains("RetryInfo")) {
                        String retryDelayStr = detail.path("retryDelay").asText("");
                        if (!retryDelayStr.isBlank()) {
                            String cleanSec = retryDelayStr.replaceAll("[^0-9]", "");
                            if (!cleanSec.isBlank()) {
                                return Integer.parseInt(cleanSec);
                            }
                        }
                    }
                }
            }

            String message = root.path("error").path("message").asText("");
            if (!message.isBlank()) {
                java.util.regex.Matcher matcher = RETRY_IN_PATTERN.matcher(message);
                if (matcher.find()) {
                    double doubleSec = Double.parseDouble(matcher.group(1));
                    return (int) Math.ceil(doubleSec);
                }
            }
        } catch (Exception e) {
            log.debug("Failed to parse retry delay from 429 response body", e);
        }

        return null;
    }

    private String getEffectiveApiKey() {
        String key = (apiKey != null && !apiKey.isBlank()) ? apiKey : groqApiKeyFallback;

        if (key == null || key.isBlank() || key.contains("your_") || key.equals("MY_GROQ_API_KEY")) {
            throw new AIProviderUnavailableException("Groq API Key is missing or not configured. Please set GROQ_API_KEY in your environment.");
        }
        return key;
    }

    private int calculateTokenEstimate(String systemPrompt, String userPrompt) {
        int totalChars = (systemPrompt != null ? systemPrompt.length() : 0)
                + (userPrompt != null ? userPrompt.length() : 0);
        return Math.max(1, totalChars / 4);
    }

    private User getCurrentUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
                return userRepository.findById(principal.getId()).orElse(null);
            }
        } catch (Exception e) {
            log.debug("Could not resolve current user from SecurityContext", e);
        }
        return null;
    }

    private void logAIRequest(User user, String feature, int tokensUsed, String status) {
        if (user == null) {
            return;
        }
        try {
            AIRequest aiRequest = AIRequest.builder()
                    .user(user)
                    .feature(feature != null ? feature : "GENERAL")
                    .tokensUsed(tokensUsed)
                    .status(status)
                    .build();
            aiRequestRepository.save(aiRequest);
        } catch (Exception e) {
            log.error("Failed to save AI request log to database", e);
        }
    }

    @Override
    public String getModel() {
        return model;
    }

    @Override
    public String getProvider() {
        return provider;
    }

    @Override
    public boolean verifyModelAvailability() {
        String effectiveKey = getEffectiveApiKey();
        String targetModel = model;
        try {
            HttpClient httpClient = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(timeoutSeconds))
                    .build();

            String baseUrlClean = apiBaseUrl.replaceAll("/+$", "");
            String endpoint;
            if (baseUrlClean.endsWith("/models")) {
                endpoint = baseUrlClean + "/" + targetModel;
            } else if (baseUrlClean.endsWith("/v1")) {
                endpoint = baseUrlClean + "/models/" + targetModel;
            } else {
                endpoint = baseUrlClean + "/v1/models/" + targetModel;
            }

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Authorization", "Bearer " + effectiveKey)
                    .header("User-Agent", "PrepWise-Backend/1.0")
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            int status = response.statusCode();
            if (status == 200) {
                log.info("Groq model verified successfully: {}", targetModel);
                return true;
            } else if (status == 404) {
                log.error("Groq model not found (HTTP 404): {}. Body: {}", targetModel, response.body());
                throw new AIProviderUnavailableException("Configured Groq model is unavailable: " + targetModel);
            } else if (status == 401 || status == 403) {
                log.error("Groq auth error (HTTP {}). Body: {}", status, response.body());
                throw new AIProviderUnavailableException("Groq API authentication failed. Please check GROQ_API_KEY.");
            } else {
                log.warn("Groq model check returned status {}. Body: {}", status, response.body());
                return false;
            }
        } catch (AIProviderUnavailableException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to verify Groq model availability: {}", e.getMessage());
            throw new AIProviderUnavailableException("Groq API request failed: " + e.getMessage(), e);
        }
    }
}

