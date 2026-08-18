package com.prepwise.dto;

import com.prepwise.entity.Difficulty;
import com.prepwise.entity.InterviewStatus;
import com.prepwise.entity.InterviewType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewHistoryItemDto {
    private Long id;
    private String title;
    private String targetRole;
    private Long companyId;
    private String companyName;
    private InterviewType interviewType;
    private InterviewStatus status;
    private Difficulty difficulty;
    private Integer questionCount;
    private Integer overallScore;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
