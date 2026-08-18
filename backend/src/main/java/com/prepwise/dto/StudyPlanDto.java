package com.prepwise.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyPlanDto {
    private Long id;
    private Long userId;
    private String title;
    private String targetRole;
    private Integer durationWeeks;
    private String planData;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
