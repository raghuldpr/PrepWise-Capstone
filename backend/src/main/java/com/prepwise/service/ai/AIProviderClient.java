package com.prepwise.service.ai;

import com.prepwise.entity.User;

public interface AIProviderClient {
    
    /**
     * Completes an AI request with system and user prompts.
     * Uses default feature "GENERAL" and derives current authenticated user if available.
     */
    String complete(String systemPrompt, String userPrompt);

    /**
     * Completes an AI request with system prompt, user prompt, and feature name.
     * Derives current authenticated user if available.
     */
    String complete(String systemPrompt, String userPrompt, String feature);

    /**
     * Completes an AI request with system prompt, user prompt, feature name, and explicit target user.
     */
    String complete(String systemPrompt, String userPrompt, String feature, User user);

    /**
     * Returns the currently configured model ID.
     */
    String getModel();

    /**
     * Returns the active AI provider name (e.g. groq).
     */
    String getProvider();

    /**
     * Verifies that the configured model is available with the configured credentials.
     * Throws an exception or returns false if unavailable.
     */
    boolean verifyModelAvailability();
}
