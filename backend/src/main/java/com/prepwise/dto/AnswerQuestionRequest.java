package com.prepwise.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerQuestionRequest {
    private Long questionId;
    private String answerText;
}
