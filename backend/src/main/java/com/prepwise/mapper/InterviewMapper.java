package com.prepwise.mapper;

import com.prepwise.dto.InterviewDto;
import com.prepwise.entity.Interview;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class InterviewMapper {

    private final InterviewQuestionMapper interviewQuestionMapper;
    private final InterviewReportMapper interviewReportMapper;

    public InterviewDto toDto(Interview entity) {
        if (entity == null) return null;
        return InterviewDto.builder()
                .id(entity.getId())
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                .title(entity.getTitle())
                .targetRole(entity.getTargetRole())
                .companyId(entity.getCompanyId())
                .companyName(entity.getCompanyName())
                .interviewType(entity.getInterviewType())
                .status(entity.getStatus())
                .difficulty(entity.getDifficulty())
                .questionCount(entity.getQuestionCount())
                .createdAt(entity.getCreatedAt())
                .completedAt(entity.getCompletedAt())
                .questions(entity.getQuestions() != null ?
                        entity.getQuestions().stream()
                                .map(interviewQuestionMapper::toDto)
                                .collect(Collectors.toList()) : null)
                .report(entity.getReport() != null ? interviewReportMapper.toDto(entity.getReport()) : null)
                .build();
    }
}
