package com.prepwise.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttemptRequestDto {

    @NotNull(message = "Question ID is required")
    private Long questionId;

    private String selectedAnswer;
    private Boolean isCorrect;
    private BigDecimal score;
    private Integer timeTakenSeconds;
}
