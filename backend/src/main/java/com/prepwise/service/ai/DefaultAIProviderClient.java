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

    @Value("${ai.model:${AI_MODEL:gemini-2.5-flash}}")
    private String model;

    @Value("${ai.api-base-url:${AI_API_BASE_URL:https://generativelanguage.googleapis.com}}")
    private String apiBaseUrl;

    @Value("${ai.timeout-seconds:${AI_TIMEOUT_SECONDS:15}}")
    private int timeoutSeconds;

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

        try {
            return sendApiCall(systemPrompt, userPrompt, effectiveKey);
        } catch (AIQuotaExceededException | AIProviderUnavailableException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Transient error during AI call. Retrying once... Error: {}", e.getMessage());
            try {
                Thread.sleep(500);
                return sendApiCall(systemPrompt, userPrompt, effectiveKey);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                throw new AIProviderUnavailableException("AI Service Temporarily Unavailable — Please try again in a few moments.", ie);
            } catch (AIQuotaExceededException | AIProviderUnavailableException ex) {
                throw ex;
            } catch (Exception ex) {
                log.error("AI call failed after retry attempt: {}", ex.getMessage());
                throw new AIProviderUnavailableException("AI Service Temporarily Unavailable — Please try again in a few moments.", ex);
            }
        }
    }

    private String sendApiCall(String systemPrompt, String userPrompt, String effectiveKey) throws Exception {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(timeoutSeconds))
                .build();

        boolean isGemini = provider.equalsIgnoreCase("gemini")
                || apiBaseUrl.contains("generativelanguage.googleapis.com");

        HttpRequest request;
        if (isGemini) {
            String url = apiBaseUrl.replaceAll("/+$", "") + "/v1beta/models/" + model + ":generateContent?key=" + effectiveKey;

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
            bodyMap.put("model", model);
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
            throw new AIQuotaExceededException("AI provider quota or rate limit exceeded.");
        }
        if (statusCode == 401 || statusCode == 403) {
            throw new AIProviderUnavailableException("Invalid AI API key or unauthorized access.");
        }
        if (statusCode >= 400) {
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
