package com.prepwise.dto;

import com.prepwise.entity.Difficulty;
import com.prepwise.entity.InterviewType;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateInterviewRequest {

    @NotBlank(message = "Target role is required")
    private String targetRole;

    private Long companyId;

    private String companyName;

    private InterviewType interviewType;

    private Difficulty difficulty;

    private Integer numberOfQuestions;
}
