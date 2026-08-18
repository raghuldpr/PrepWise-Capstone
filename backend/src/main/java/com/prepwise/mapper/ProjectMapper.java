package com.prepwise.mapper;

import com.prepwise.dto.ProjectDto;
import com.prepwise.entity.Project;
import org.springframework.stereotype.Component;

@Component
public class ProjectMapper {

    public ProjectDto toDto(Project entity) {
        if (entity == null) return null;
        return ProjectDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .difficulty(entity.getDifficulty())
                .domain(entity.getDomain())
                .technologyStack(entity.getTechnologyStack())
                .skillsCovered(entity.getSkillsCovered())
                .placementRelevance(entity.getPlacementRelevance())
                .developmentRoadmap(entity.getDevelopmentRoadmap())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
