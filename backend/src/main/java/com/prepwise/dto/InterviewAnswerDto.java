package com.prepwise.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewAnswerDto {
    private Long id;
    private Long questionId;
    private String userAnswer;
    private String audioUrl;
    private Integer score;
    private String feedback;
    private String sampleAnswer;
    private LocalDateTime answeredAt;
}
