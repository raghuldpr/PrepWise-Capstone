package com.prepwise.mapper;

import com.prepwise.dto.SkillGapAnalysisDto;
import com.prepwise.entity.SkillGapAnalysis;
import org.springframework.stereotype.Component;

@Component
public class SkillGapAnalysisMapper {

    public SkillGapAnalysisDto toDto(SkillGapAnalysis entity) {
        if (entity == null) return null;
        return SkillGapAnalysisDto.builder()
                .id(entity.getId())
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                .targetRole(entity.getTargetRole())
                .existingSkills(entity.getExistingSkills())
                .missingSkills(entity.getMissingSkills())
                .recommendations(entity.getRecommendations())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
