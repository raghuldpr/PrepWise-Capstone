package com.prepwise.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaveGoalsRequest {

    @NotBlank(message = "Target role is required")
    private String targetRole;

    private String targetCompany;

    private String careerGoal;

    private String education;

    private String college;

    private Integer graduationYear;

    private String bio;
}
