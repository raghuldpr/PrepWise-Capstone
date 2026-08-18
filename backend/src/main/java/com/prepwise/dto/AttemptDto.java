package com.prepwise.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttemptDto {
    private Long id;
    private Long userId;
    private Long questionId;
    private String questionTitle;
    private String selectedAnswer;
    private Boolean isCorrect;
    private BigDecimal score;
    private Integer timeTakenSeconds;
    private LocalDateTime attemptedAt;
}
