package com.prepwise.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillGapAnalysisDto {
    private Long id;
    private Long userId;
    private String targetRole;
    private String existingSkills;
    private String missingSkills;
    private String recommendations;
    private LocalDateTime createdAt;
}
