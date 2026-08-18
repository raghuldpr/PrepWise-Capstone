package com.prepwise.mapper;

import com.prepwise.dto.StudyPlanDto;
import com.prepwise.entity.StudyPlan;
import org.springframework.stereotype.Component;

@Component
public class StudyPlanMapper {

    public StudyPlanDto toDto(StudyPlan entity) {
        if (entity == null) return null;
        return StudyPlanDto.builder()
                .id(entity.getId())
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                .title(entity.getTitle())
                .targetRole(entity.getTargetRole())
                .durationWeeks(entity.getDurationWeeks())
                .planData(entity.getPlanData())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
