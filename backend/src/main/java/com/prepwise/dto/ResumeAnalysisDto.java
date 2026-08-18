package com.prepwise.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeAnalysisDto {
    private Long id;
    private Long resumeId;
    private Integer overallScore;
    private String strengths;
    private String weaknesses;
    private String missingSkills;
    private String suggestions;
    private String analysisModel;
    private LocalDateTime createdAt;
}
