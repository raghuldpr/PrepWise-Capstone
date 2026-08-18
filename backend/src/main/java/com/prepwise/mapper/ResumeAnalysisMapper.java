package com.prepwise.mapper;

import com.prepwise.dto.ResumeAnalysisDto;
import com.prepwise.entity.ResumeAnalysis;
import org.springframework.stereotype.Component;

@Component
public class ResumeAnalysisMapper {

    public ResumeAnalysisDto toDto(ResumeAnalysis entity) {
        if (entity == null) return null;
        return ResumeAnalysisDto.builder()
                .id(entity.getId())
                .resumeId(entity.getResume() != null ? entity.getResume().getId() : null)
                .overallScore(entity.getOverallScore())
                .strengths(entity.getStrengths())
                .weaknesses(entity.getWeaknesses())
                .missingSkills(entity.getMissingSkills())
                .suggestions(entity.getSuggestions())
                .analysisModel(entity.getAnalysisModel())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
