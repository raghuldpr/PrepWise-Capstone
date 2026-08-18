package com.prepwise.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillGapAnalysisResponse {
    private Long id;
    private String targetRole;
    private List<String> existingStrengths;
    private List<String> missingSkills;
    private List<String> skillsToImprove;
    private List<String> recommendedLearningOrder;
    private LocalDateTime createdAt;
}
