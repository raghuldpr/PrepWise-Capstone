package com.prepwise.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "phone")
    private String phone;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "degree")
    private String degree;

    @Column(name = "branch")
    private String branch;

    @Column(name = "current_semester")
    private String currentSemester;

    @Column(name = "education")
    private String education;

    @Column(name = "college")
    private String college;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    @Column(name = "target_role")
    private String targetRole;

    @Column(name = "target_company")
    private String targetCompany;

    @Column(name = "preferred_industry")
    private String preferredIndustry;

    @Column(name = "placement_status")
    private String placementStatus;

    @Column(name = "expected_package")
    private String expectedPackage;

    @Column(name = "preferred_location")
    private String preferredLocation;

    @Column(name = "job_type")
    private String jobType;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "portfolio_url")
    private String portfolioUrl;

    @Column(name = "resume_url")
    private String resumeUrl;

    @Column(name = "certifications", columnDefinition = "TEXT")
    private String certifications;

    @Column(name = "target_companies_data", columnDefinition = "TEXT")
    private String targetCompaniesData;

    @Column(name = "settings_data", columnDefinition = "TEXT")
    private String settingsData;

    @Column(name = "career_goal", columnDefinition = "TEXT")
    private String careerGoal;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
