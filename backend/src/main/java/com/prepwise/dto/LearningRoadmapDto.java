package com.prepwise.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningRoadmapDto {
    private Long id;
    private Long userId;
    private String targetRole;
    private String roadmapData;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
