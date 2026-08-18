package com.prepwise.mapper;

import com.prepwise.dto.LearningRoadmapDto;
import com.prepwise.entity.LearningRoadmap;
import org.springframework.stereotype.Component;

@Component
public class LearningRoadmapMapper {

    public LearningRoadmapDto toDto(LearningRoadmap entity) {
        if (entity == null) return null;
        return LearningRoadmapDto.builder()
                .id(entity.getId())
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                .targetRole(entity.getTargetRole())
                .roadmapData(entity.getRoadmapData())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
