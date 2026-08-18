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
}
