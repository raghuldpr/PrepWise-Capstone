package com.prepwise.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewQuestionDto {
    private Long id;
    private Long interviewId;
    private Integer questionOrder;
    private String questionText;
    private String questionType;
    private String expectedConcepts;
    private String starterCode;
    private String testCasesJson;
    private String solutionCode;
    private InterviewAnswerDto answer;
}
