package com.prepwise.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewReportDto {
    private Long id;
    private Long interviewId;
    private Integer overallScore;
    private Integer technicalScore;
    private Integer communicationScore;
    private Integer problemSolvingScore;
    private String strengths;
    private String areasForImprovement;
    private String overallSummary;
    private String recommendations;
    private String status;
    private boolean generating;
    private LocalDateTime generatedAt;
}
