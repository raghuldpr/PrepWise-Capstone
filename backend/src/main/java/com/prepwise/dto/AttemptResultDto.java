package com.prepwise.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttemptResultDto {
    private Long attemptId;
    private Long questionId;
    private Boolean isCorrect;
    private BigDecimal score;
    private String selectedAnswer;
    private String correctAnswer;
    private String explanation;
    private BigDecimal currentAccuracy;
    private LocalDateTime attemptedAt;
}
