package com.prepwise.dto;

import com.prepwise.entity.Role;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {

    private Long id;
    private String name;
    private String email;
    private Role role;
    private Boolean onboardingCompleted;
    private String education;
    private String college;
    private Integer graduationYear;
    private String targetRole;
    private String targetCompany;
    private String careerGoal;
    private String bio;
    private LocalDateTime createdAt;
}
