package com.prepwise.service;

import com.prepwise.dto.AIConversationDto;
import com.prepwise.dto.AskQuestionRequest;
import com.prepwise.dto.AskQuestionResponse;
import com.prepwise.entity.AIConversation;
import com.prepwise.entity.AIMessage;
import com.prepwise.entity.User;
import com.prepwise.exception.ResourceNotFoundException;
import com.prepwise.mapper.AIConversationMapper;
import com.prepwise.repository.AIConversationRepository;
import com.prepwise.repository.AIMessageRepository;
import com.prepwise.repository.UserRepository;
import com.prepwise.service.ai.AIProviderClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIAssistantService {

    private final AIConversationRepository aiConversationRepository;
    private final AIMessageRepository aiMessageRepository;
    private final UserRepository userRepository;
    private final AIProviderClient aiProviderClient;
    private final AIConversationMapper aiConversationMapper;

    @Transactional
    public AskQuestionResponse ask(Long userId, AskQuestionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        AIConversation conversation;
        if (request.getConversationId() != null) {
            conversation = aiConversationRepository.findByIdAndUserId(request.getConversationId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + request.getConversationId()));
        } else {
            String title = generateTitle(request.getQuestion());
            String context = request.getContext() != null && !request.getContext().isBlank()
                    ? request.getContext()
                    : "Placement Preparation Assistant";

            conversation = AIConversation.builder()
                    .user(user)
                    .title(title)
                    .context(context)
                    .build();
            conversation = aiConversationRepository.save(conversation);
        }

        // Save user message
        AIMessage userMessage = AIMessage.builder()
                .conversation(conversation)
                .role("user")
                .messageText(request.getQuestion())
                .build();
        userMessage = aiMessageRepository.save(userMessage);

        if (conversation.getMessages() != null) {
            conversation.getMessages().add(userMessage);
        }

        // Construct prompt context from conversation history
        String systemPrompt = "You are PrepWise AI, an expert career and placement preparation assistant. " +
                "Provide clear, structured, technical, and encouraging guidance to help students excel in placement interviews, " +
                "aptitude tests, coding assessments, resume reviews, and career planning.";

        StringBuilder historyBuilder = new StringBuilder();
        if (conversation.getContext() != null && !conversation.getContext().isBlank()) {
            historyBuilder.append("Conversation Topic / Context: ").append(conversation.getContext()).append("\n\n");
        }

        List<AIMessage> messages = aiMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId());
        for (AIMessage msg : messages) {
            String roleName = "user".equalsIgnoreCase(msg.getRole()) ? "Student" : "PrepWise AI";
            historyBuilder.append(roleName).append(": ").append(msg.getMessageText()).append("\n\n");
        }

        // Call AI Provider
        String aiReply = aiProviderClient.complete(
                systemPrompt,
                historyBuilder.toString().trim(),
                "AI_ASSISTANT",
                user
        );

        // Save AI reply message
        AIMessage aiMessage = AIMessage.builder()
                .conversation(conversation)
                .role("assistant")
                .messageText(aiReply)
                .build();
        aiMessageRepository.save(aiMessage);

        if (conversation.getMessages() != null) {
            conversation.getMessages().add(aiMessage);
        }

        // Save conversation to trigger updatedAt timestamp
        conversation = aiConversationRepository.save(conversation);

        AIConversationDto conversationDto = aiConversationMapper.toDto(conversation);

        return AskQuestionResponse.builder()
                .conversationId(conversation.getId())
                .reply(aiReply)
                .title(conversation.getTitle())
                .conversation(conversationDto)
                .build();
    }

    @Transactional(readOnly = true)
    public List<AIConversationDto> getConversations(Long userId) {
        List<AIConversation> conversations = aiConversationRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        return conversations.stream()
                .map(aiConversationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AIConversationDto getConversationById(Long userId, Long conversationId) {
        AIConversation conversation = aiConversationRepository.findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + conversationId));
        return aiConversationMapper.toDto(conversation);
    }

    @Transactional
    public void deleteConversation(Long userId, Long conversationId) {
        AIConversation conversation = aiConversationRepository.findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + conversationId));
        aiConversationRepository.delete(conversation);
    }

    private String generateTitle(String question) {
        if (question == null || question.isBlank()) {
            return "New Conversation";
        }
        String trimmed = question.trim();
        if (trimmed.length() <= 50) {
            return trimmed;
        }
        return trimmed.substring(0, 47) + "...";
    }
}
