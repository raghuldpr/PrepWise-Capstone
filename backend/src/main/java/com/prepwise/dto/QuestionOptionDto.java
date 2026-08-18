package com.prepwise.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionOptionDto {
    private Long id;
    private Long questionId;
    private String optionText;
    private Boolean isCorrect;
}
