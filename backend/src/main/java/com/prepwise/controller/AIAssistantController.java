package com.prepwise.controller;

import com.prepwise.dto.AIConversationDto;
import com.prepwise.dto.AskQuestionRequest;
import com.prepwise.dto.AskQuestionResponse;
import com.prepwise.security.UserPrincipal;
import com.prepwise.service.AIAssistantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIAssistantController {

    private final AIAssistantService aiAssistantService;

    @PostMapping("/ask")
    public ResponseEntity<AskQuestionResponse> ask(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody AskQuestionRequest request) {
        AskQuestionResponse response = aiAssistantService.ask(userPrincipal.getId(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<AIConversationDto>> getConversations(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<AIConversationDto> conversations = aiAssistantService.getConversations(userPrincipal.getId());
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/conversations/{id}")
    public ResponseEntity<AIConversationDto> getConversation(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("id") Long conversationId) {
        AIConversationDto conversation = aiAssistantService.getConversationById(userPrincipal.getId(), conversationId);
        return ResponseEntity.ok(conversation);
    }

    @DeleteMapping("/conversations/{id}")
    public ResponseEntity<?> deleteConversation(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("id") Long conversationId) {
        aiAssistantService.deleteConversation(userPrincipal.getId(), conversationId);
        return ResponseEntity.ok(Map.of("message", "Conversation deleted successfully"));
    }
}
