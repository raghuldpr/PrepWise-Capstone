package com.prepwise.mapper;

import com.prepwise.dto.AIRequestDto;
import com.prepwise.entity.AIRequest;
import org.springframework.stereotype.Component;

@Component
public class AIRequestMapper {

    public AIRequestDto toDto(AIRequest entity) {
        if (entity == null) return null;
        return AIRequestDto.builder()
                .id(entity.getId())
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                .feature(entity.getFeature())
                .tokensUsed(entity.getTokensUsed())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
