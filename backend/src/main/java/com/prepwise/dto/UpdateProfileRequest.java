package com.prepwise.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {

    private String name;
    private String phone;
    private String avatarUrl;
    private String degree;
    private String branch;
    private String currentSemester;
    private String education;
    private String college;
    private Integer graduationYear;
    private String targetRole;
    private String targetCompany;
    private String preferredIndustry;
    private String placementStatus;
    private String expectedPackage;
    private String preferredLocation;
    private String jobType;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    private String resumeUrl;
    private String certifications;
    private String targetCompaniesData;
    private String settingsData;
    private String careerGoal;
    private String bio;
    private List<UserSkillSelectionDto> skills;
}
