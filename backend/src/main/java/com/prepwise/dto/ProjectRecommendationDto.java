package com.prepwise.dto;

import com.prepwise.entity.Difficulty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectRecommendationDto {
    private Long id;
    private String title;
    private String problemStatement;
    private String description;
    private String techStack;
    private String technologyStack;
    private Difficulty difficulty;
    private String skillsCovered;
    private String placementRelevance;
    private String whyItsUseful;
    private String roadmap;
    private String developmentRoadmap;
    private String futureEnhancements;
}
