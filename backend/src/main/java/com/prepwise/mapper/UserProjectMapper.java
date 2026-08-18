package com.prepwise.mapper;

import com.prepwise.dto.UserProjectDto;
import com.prepwise.entity.UserProject;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserProjectMapper {

    private final ProjectMapper projectMapper;

    public UserProjectDto toDto(UserProject entity) {
        if (entity == null) return null;
        return UserProjectDto.builder()
                .id(entity.getId())
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                .projectId(entity.getProject() != null ? entity.getProject().getId() : null)
                .project(entity.getProject() != null ? projectMapper.toDto(entity.getProject()) : null)
                .status(entity.getStatus())
                .startedAt(entity.getStartedAt())
                .completedAt(entity.getCompletedAt())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
