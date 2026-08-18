package com.prepwise.mapper;

import com.prepwise.dto.InterviewReportDto;
import com.prepwise.entity.InterviewReport;
import org.springframework.stereotype.Component;

@Component
public class InterviewReportMapper {

    public InterviewReportDto toDto(InterviewReport entity) {
        if (entity == null) return null;
        return InterviewReportDto.builder()
                .id(entity.getId())
                .interviewId(entity.getInterview() != null ? entity.getInterview().getId() : null)
                .overallScore(entity.getOverallScore())
                .technicalScore(entity.getTechnicalScore())
                .communicationScore(entity.getCommunicationScore())
                .problemSolvingScore(entity.getProblemSolvingScore())
                .strengths(entity.getStrengths())
                .areasForImprovement(entity.getAreasForImprovement())
                .overallSummary(entity.getOverallSummary())
                .recommendations(entity.getRecommendations())
                .status("READY")
                .generating(false)
                .generatedAt(entity.getGeneratedAt())
                .build();
    }
}
