package com.prepwise.dto;

import com.prepwise.entity.ModuleType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressDto {
    private Long id;
    private Long userId;
    private Long categoryId;
    private String categoryName;
    private ModuleType moduleType;
    private Integer questionsAttempted;
    private Integer questionsCorrect;
    private BigDecimal accuracy;
    private BigDecimal averageScore;
    private LocalDateTime updatedAt;
}
