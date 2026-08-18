package com.prepwise.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenerateStudyPlanRequest {
    private String availableStudyTime;
    private String targetRole;
    private String currentSkillLevel;
    private String targetDeadline;
}
