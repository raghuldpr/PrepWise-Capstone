package com.prepwise.dto;

import com.prepwise.entity.Difficulty;
import com.prepwise.entity.InterviewStatus;
import com.prepwise.entity.InterviewType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewDto {
    private Long id;
    private Long userId;
    private String title;
    private String targetRole;
    private Long companyId;
    private String companyName;
    private InterviewType interviewType;
    private InterviewStatus status;
    private Difficulty difficulty;
    private Integer questionCount;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private List<InterviewQuestionDto> questions;
    private InterviewReportDto report;
}
