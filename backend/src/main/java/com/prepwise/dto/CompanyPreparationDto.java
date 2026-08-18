package com.prepwise.dto;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyPreparationDto {
    private CompanyDto company;
    private long totalQuestions;
    private long aptitudeQuestionsCount;
    private long codingQuestionsCount;
    private long dsaQuestionsCount;
    private long technicalQuestionsCount;
    private long hrQuestionsCount;
    private Map<String, Long> questionCountsByModule;
}
