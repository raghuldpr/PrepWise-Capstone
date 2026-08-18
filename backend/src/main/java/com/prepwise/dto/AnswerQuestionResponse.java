package com.prepwise.dto;

import com.prepwise.entity.InterviewStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerQuestionResponse {
    private InterviewAnswerDto answer;
    private InterviewQuestionDto nextQuestion;
    private boolean readyForCompletion;
    private InterviewStatus interviewStatus;
}
