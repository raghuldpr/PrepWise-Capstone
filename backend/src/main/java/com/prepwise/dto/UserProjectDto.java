package com.prepwise.dto;

import com.prepwise.entity.UserProjectStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProjectDto {
    private Long id;
    private Long userId;
    private Long projectId;
    private ProjectDto project;
    private UserProjectStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
}
