package com.prepwise.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodingSubmitResponse {
    private Long questionId;
    private boolean passed;
    private List<TestCaseResult> testCaseResults;
    private Integer score;
    private String timeComplexity;
    private String spaceComplexity;
    private String qualityComment;
    private String solutionCode;
    private InterviewAnswerDto answer;
    private boolean readyForCompletion;
    private InterviewQuestionDto nextQuestion;
}
