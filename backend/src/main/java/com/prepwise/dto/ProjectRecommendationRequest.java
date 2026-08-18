package com.prepwise.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectRecommendationRequest {
    private String language;
    private String domain;
    private String difficulty;
    private Boolean fullStackRequired;
    private String careerGoal;
}
