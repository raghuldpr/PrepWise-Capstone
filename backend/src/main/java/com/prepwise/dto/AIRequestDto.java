package com.prepwise.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIRequestDto {
    private Long id;
    private Long userId;
    private String feature;
    private Integer tokensUsed;
    private String status;
    private LocalDateTime createdAt;
}
