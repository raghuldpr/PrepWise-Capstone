package com.prepwise.mapper;

import com.prepwise.dto.AIConversationDto;
import com.prepwise.entity.AIConversation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class AIConversationMapper {

    private final AIMessageMapper aiMessageMapper;

    public AIConversationDto toDto(AIConversation entity) {
        if (entity == null) return null;
        return AIConversationDto.builder()
                .id(entity.getId())
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                .title(entity.getTitle())
                .context(entity.getContext())
                .messages(entity.getMessages() != null ?
                        entity.getMessages().stream().map(aiMessageMapper::toDto).collect(Collectors.toList()) :
                        Collections.emptyList())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
