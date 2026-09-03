package com.prepwise.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAnalyticsResponse {

    private BigDecimal overallProgressPercent;
    private BigDecimal overallAccuracy;
    private Integer totalQuestionsAttempted;
    private Integer totalQuestionsSolved;
    private Integer mockInterviewsCompleted;
    private BigDecimal averageMockInterviewScore;
    private Integer currentStreakDays;
    private Integer totalPracticeMinutes;

    // Module Breakdowns
    private ModuleProgressDto aptitudeProgress;
    private ModuleProgressDto codingProgress;
    private ModuleProgressDto dsaProgress;
    private ModuleProgressDto technicalProgress;
    private ModuleProgressDto hrProgress;

    // Category Breakdowns
    private List<ProgressDto> categoryBreakdowns;

    // Strengths & Weak Areas
    private List<TopicPerformanceDto> strongAreas;
    private List<TopicPerformanceDto> weakAreas;
    private List<TopicPerformanceDto> topicsNeedingImprovement;
    private List<RecentActivityDto> recentActivities;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ModuleProgressDto {
        private String moduleType;
        private String moduleName;
        private Integer attempted;
        private Integer solved;
        private BigDecimal accuracy;
        private BigDecimal progressPercent;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopicPerformanceDto {
        private String topic;
        private String categoryName;
        private String moduleType;
        private BigDecimal accuracy;
        private Integer attempted;
        private Integer correct;
        private String recommendation;
        private String practiceLink;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentActivityDto {
        private String id;
        private String type; // ATTEMPT, INTERVIEW, RESUME, PROJECT
        private String title;
        private String subtitle;
        private String score;
        private String timestamp;
        private Boolean isSuccess;
    }
}
