package com.prepwise.dto;

import com.prepwise.entity.Difficulty;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDto {
    private Long id;
    private String title;
    private String description;
    private Difficulty difficulty;
    private String domain;
    private String technologyStack;
    private String skillsCovered;
    private String placementRelevance;
    private String developmentRoadmap;
    private LocalDateTime createdAt;
}
