package com.prepwise.mapper;

import com.prepwise.dto.AIMessageDto;
import com.prepwise.entity.AIMessage;
import org.springframework.stereotype.Component;

@Component
public class AIMessageMapper {

    public AIMessageDto toDto(AIMessage entity) {
        if (entity == null) return null;
        return AIMessageDto.builder()
                .id(entity.getId())
                .conversationId(entity.getConversation() != null ? entity.getConversation().getId() : null)
                .role(entity.getRole())
                .messageText(entity.getMessageText())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
