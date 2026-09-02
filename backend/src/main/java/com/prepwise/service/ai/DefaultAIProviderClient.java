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

    @Value("${ai.provider:${AI_PROVIDER:gemini}}")
    private String provider;

    @Value("${ai.api-key:${AI_API_KEY:}}")
    private String apiKey;

    @Value("${GEMINI_API_KEY:}")
    private String geminiApiKeyFallback;

    @Value("${ai.model:${AI_MODEL:gemini-1.5-flash}}")
    private String model;

    @Value("${ai.fallback-model:${AI_FALLBACK_MODEL:gemini-2.0-flash}}")
    private String fallbackModel;

    @Value("${ai.api-base-url:${AI_API_BASE_URL:https://generativelanguage.googleapis.com}}")
    private String apiBaseUrl;

    @Value("${ai.timeout-seconds:${AI_TIMEOUT_SECONDS:30}}")
    private int timeoutSeconds;

    private static final java.util.regex.Pattern RETRY_IN_PATTERN =
            java.util.regex.Pattern.compile("retry in ([0-9]+(?:\\.[0-9]+)?)s", java.util.regex.Pattern.CASE_INSENSITIVE);

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
                    throw new AIProviderUnavailableException("AI Service Temporarily Unavailable — Please try again in a few moments.", e);
                }
            }
        }
        throw new AIProviderUnavailableException("AI Service Temporarily Unavailable — Please try again in a few moments.");
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
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();
        } else {
            String baseUrlClean = apiBaseUrl.replaceAll("/+$", "");
            String endpoint = baseUrlClean.endsWith("/v1") ? baseUrlClean + "/chat/completions" : baseUrlClean + "/v1/chat/completions";

            Map<String, Object> bodyMap = new HashMap<>();
            bodyMap.put("model", targetModel);
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
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();
        }

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        int statusCode = response.statusCode();
        if (statusCode == 429) {
            Integer retryDelaySec = parseRetryDelaySeconds(response);
            log.warn("Gemini API Rate Limit hit (HTTP 429) for model {}. Body: {}. Parsed retryDelay: {}s", targetModel, response.body(), retryDelaySec);
            String msg = (retryDelaySec != null && retryDelaySec > 0)
                    ? "AI service rate limit reached. Please try again in " + retryDelaySec + " seconds."
                    : "AI provider quota or rate limit exceeded.";
            throw new AIQuotaExceededException(msg, retryDelaySec);
        }
        if (statusCode == 401 || statusCode == 403) {
            log.error("Gemini API Auth Error (HTTP {}). Body: {}", statusCode, response.body());
            throw new AIProviderUnavailableException("Invalid AI API key or unauthorized access.");
        }
        if (statusCode >= 400) {
            log.error("Gemini API Error (HTTP {}). Body: {}", statusCode, response.body());
            throw new RuntimeException("AI Provider returned HTTP status " + statusCode + ": " + response.body());
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
            JsonNode textNode = rootNode.path("choices").get(0).path("message").path("content");
            if (textNode.isMissingNode() || textNode.isNull()) {
                throw new AIProviderUnavailableException("Invalid response format from OpenAI AI provider.");
            }
            contentText = textNode.asText();
        }

        return contentText;
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
        String key = apiKey != null && !apiKey.isBlank() ? apiKey : geminiApiKeyFallback;
        if (key == null || key.isBlank() || key.equals("MY_GEMINI_API_KEY")) {
            throw new AIProviderUnavailableException("AI API Key is missing or not configured.");
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
}

