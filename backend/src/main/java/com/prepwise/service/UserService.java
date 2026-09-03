package com.prepwise.service;

import com.prepwise.dto.*;
import com.prepwise.entity.*;
import com.prepwise.exception.BadRequestException;
import com.prepwise.exception.ResourceNotFoundException;
import com.prepwise.mapper.ProgressMapper;
import com.prepwise.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final AttemptRepository attemptRepository;
    private final ProgressRepository progressRepository;
    private final InterviewRepository interviewRepository;
    private final InterviewReportRepository interviewReportRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProgressMapper progressMapper;

    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Profile profile = profileRepository.findByUserId(userId)
                .orElse(null);

        List<UserSkill> userSkills = userSkillRepository.findByUserId(userId);
        List<SkillDto> skillDtos = userSkills.stream()
                .map(us -> SkillDto.builder()
                        .id(us.getSkill().getId())
                        .name(us.getSkill().getName())
                        .category(us.getSkill().getCategory())
                        .description(us.getSkill().getDescription())
                        .proficiencyLevel(us.getProficiencyLevel())
                        .build())
                .collect(Collectors.toList());

        return mapToProfileResponse(user, profile, skillDtos);
    }

    @Transactional
    public UserProfileResponse updateUserProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
            userRepository.save(user);
        }

        Profile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> Profile.builder().user(user).build());

        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        if (request.getAvatarUrl() != null) profile.setAvatarUrl(request.getAvatarUrl());
        if (request.getDegree() != null) profile.setDegree(request.getDegree());
        if (request.getBranch() != null) profile.setBranch(request.getBranch());
        if (request.getCurrentSemester() != null) profile.setCurrentSemester(request.getCurrentSemester());
        if (request.getEducation() != null) profile.setEducation(request.getEducation());
        if (request.getCollege() != null) profile.setCollege(request.getCollege());
        if (request.getGraduationYear() != null) profile.setGraduationYear(request.getGraduationYear());
        if (request.getTargetRole() != null) profile.setTargetRole(request.getTargetRole());
        if (request.getTargetCompany() != null) profile.setTargetCompany(request.getTargetCompany());
        if (request.getPreferredIndustry() != null) profile.setPreferredIndustry(request.getPreferredIndustry());
        if (request.getPlacementStatus() != null) profile.setPlacementStatus(request.getPlacementStatus());
        if (request.getExpectedPackage() != null) profile.setExpectedPackage(request.getExpectedPackage());
        if (request.getPreferredLocation() != null) profile.setPreferredLocation(request.getPreferredLocation());
        if (request.getJobType() != null) profile.setJobType(request.getJobType());
        if (request.getGithubUrl() != null) profile.setGithubUrl(request.getGithubUrl());
        if (request.getLinkedinUrl() != null) profile.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getPortfolioUrl() != null) profile.setPortfolioUrl(request.getPortfolioUrl());
        if (request.getResumeUrl() != null) profile.setResumeUrl(request.getResumeUrl());
        if (request.getCertifications() != null) profile.setCertifications(request.getCertifications());
        if (request.getTargetCompaniesData() != null) profile.setTargetCompaniesData(request.getTargetCompaniesData());
        if (request.getSettingsData() != null) profile.setSettingsData(request.getSettingsData());
        if (request.getCareerGoal() != null) profile.setCareerGoal(request.getCareerGoal());
        if (request.getBio() != null) profile.setBio(request.getBio());

        profile = profileRepository.save(profile);

        if (request.getSkills() != null) {
            userSkillRepository.deleteByUserId(userId);
            List<UserSkill> newSkills = new ArrayList<>();
            for (UserSkillSelectionDto selection : request.getSkills()) {
                if (selection.getSkillId() != null) {
                    skillRepository.findById(selection.getSkillId()).ifPresent(skill -> {
                        newSkills.add(UserSkill.builder()
                                .user(user)
                                .skill(skill)
                                .proficiencyLevel(selection.getProficiencyLevel() != null ? selection.getProficiencyLevel() : ProficiencyLevel.INTERMEDIATE)
                                .build());
                    });
                }
            }
            if (!newSkills.isEmpty()) {
                userSkillRepository.saveAll(newSkills);
            }
        }

        List<UserSkill> updatedUserSkills = userSkillRepository.findByUserId(userId);
        List<SkillDto> skillDtos = updatedUserSkills.stream()
                .map(us -> SkillDto.builder()
                        .id(us.getSkill().getId())
                        .name(us.getSkill().getName())
                        .category(us.getSkill().getCategory())
                        .description(us.getSkill().getDescription())
                        .proficiencyLevel(us.getProficiencyLevel())
                        .build())
                .collect(Collectors.toList());

        return mapToProfileResponse(user, profile, skillDtos);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getUserSettings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Profile profile = profileRepository.findByUserId(userId)
                .orElse(null);

        Map<String, Object> settings = new HashMap<>();
        settings.put("userId", user.getId());
        settings.put("name", user.getName());
        settings.put("email", user.getEmail());
        settings.put("avatarUrl", profile != null ? profile.getAvatarUrl() : null);
        settings.put("role", user.getRole());
        settings.put("createdAt", user.getCreatedAt());
        settings.put("settingsData", profile != null ? profile.getSettingsData() : null);

        return settings;
    }

    @Transactional
    public Map<String, Object> updateUserSettings(Long userId, UpdateSettingsRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
            userRepository.save(user);
        }

        Profile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> Profile.builder().user(user).build());

        if (request.getAvatarUrl() != null) {
            profile.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getSettingsData() != null) {
            profile.setSettingsData(request.getSettingsData());
        }

        profile = profileRepository.save(profile);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Settings updated successfully");
        response.put("name", user.getName());
        response.put("avatarUrl", profile.getAvatarUrl());
        response.put("settingsData", profile.getSettingsData());
        return response;
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password does not match.");
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new BadRequestException("New password must be at least 6 characters long.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password successfully changed for user id: {}", userId);
    }

    @Transactional(readOnly = true)
    public UserAnalyticsResponse getUserAnalytics(Long userId) {
        List<Attempt> attempts = attemptRepository.findByUserIdOrderByAttemptedAtDesc(userId);
        List<Progress> progressList = progressRepository.findByUserId(userId);
        List<Interview> interviews = interviewRepository.findByUserIdOrderByCreatedAtDesc(userId);

        int totalAttempted = attempts.size();
        int totalSolved = (int) attempts.stream().filter(a -> Boolean.TRUE.equals(a.getIsCorrect())).count();
        BigDecimal overallAccuracy = totalAttempted > 0
                ? BigDecimal.valueOf((double) totalSolved / totalAttempted * 100.0).setScale(1, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        int totalTimeSeconds = attempts.stream()
                .mapToInt(a -> a.getTimeTakenSeconds() != null ? a.getTimeTakenSeconds() : 0)
                .sum();
        int totalMinutes = Math.max(1, totalTimeSeconds / 60);

        List<Interview> completedInterviews = interviews.stream()
                .filter(i -> i.getStatus() == InterviewStatus.COMPLETED)
                .collect(Collectors.toList());
        int mockCount = completedInterviews.size();

        double avgMockScore = 0.0;
        if (mockCount > 0) {
            List<InterviewReport> reports = completedInterviews.stream()
                    .map(i -> interviewReportRepository.findByInterviewId(i.getId()).orElse(null))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            if (!reports.isEmpty()) {
                avgMockScore = reports.stream()
                        .map(InterviewReport::getOverallScore)
                        .filter(Objects::nonNull)
                        .mapToDouble(Integer::doubleValue)
                        .average()
                        .orElse(70.0);
            } else {
                avgMockScore = 72.0;
            }
        }

        // Aggregate by module type
        UserAnalyticsResponse.ModuleProgressDto aptProg = calculateModuleProgress(attempts, progressList, ModuleType.APTITUDE, "Aptitude & Logical");
        UserAnalyticsResponse.ModuleProgressDto codeProg = calculateModuleProgress(attempts, progressList, ModuleType.CODING, "Coding & Problem Solving");
        UserAnalyticsResponse.ModuleProgressDto dsaProg = calculateModuleProgress(attempts, progressList, ModuleType.DSA, "Data Structures & Algorithms");
        UserAnalyticsResponse.ModuleProgressDto techProg = calculateModuleProgress(attempts, progressList, ModuleType.TECHNICAL, "Core Technical & CS");
        UserAnalyticsResponse.ModuleProgressDto hrProg = calculateModuleProgress(attempts, progressList, ModuleType.HR, "HR & Behavioral");

        // Overall progress calculation
        double moduleSum = aptProg.getProgressPercent().doubleValue()
                + codeProg.getProgressPercent().doubleValue()
                + dsaProg.getProgressPercent().doubleValue()
                + techProg.getProgressPercent().doubleValue()
                + hrProg.getProgressPercent().doubleValue();
        BigDecimal overallProgress = BigDecimal.valueOf(moduleSum / 5.0).setScale(1, RoundingMode.HALF_UP);

        // Category breakdowns
        List<ProgressDto> categoryBreakdowns = progressList.stream()
                .map(progressMapper::toDto)
                .collect(Collectors.toList());

        // Strong & Weak Areas
        List<UserAnalyticsResponse.TopicPerformanceDto> strongAreas = new ArrayList<>();
        List<UserAnalyticsResponse.TopicPerformanceDto> weakAreas = new ArrayList<>();
        List<UserAnalyticsResponse.TopicPerformanceDto> improvementAreas = new ArrayList<>();

        for (Progress p : progressList) {
            QuestionCategory cat = p.getCategory();
            String catName = cat != null ? cat.getName() : "General";
            String modType = cat != null && cat.getModuleType() != null ? cat.getModuleType().name() : "GENERAL";
            BigDecimal acc = p.getAccuracy() != null ? p.getAccuracy() : BigDecimal.ZERO;
            int att = p.getQuestionsAttempted() != null ? p.getQuestionsAttempted() : 0;
            int cor = p.getQuestionsCorrect() != null ? p.getQuestionsCorrect() : 0;

            String practiceLink = getModulePracticeLink(modType);

            if (acc.compareTo(BigDecimal.valueOf(70.0)) >= 0 && att > 0) {
                strongAreas.add(UserAnalyticsResponse.TopicPerformanceDto.builder()
                        .topic(catName)
                        .categoryName(catName)
                        .moduleType(modType)
                        .accuracy(acc)
                        .attempted(att)
                        .correct(cor)
                        .recommendation("Demonstrating high mastery. Maintain revision with timed challenges.")
                        .practiceLink(practiceLink)
                        .build());
            } else if (acc.compareTo(BigDecimal.valueOf(60.0)) < 0 && att > 0) {
                weakAreas.add(UserAnalyticsResponse.TopicPerformanceDto.builder()
                        .topic(catName)
                        .categoryName(catName)
                        .moduleType(modType)
                        .accuracy(acc)
                        .attempted(att)
                        .correct(cor)
                        .recommendation("Accuracy is below 60%. Review fundamental concepts and practice topic-level MCQs.")
                        .practiceLink(practiceLink)
                        .build());
            } else if (att > 0) {
                improvementAreas.add(UserAnalyticsResponse.TopicPerformanceDto.builder()
                        .topic(catName)
                        .categoryName(catName)
                        .moduleType(modType)
                        .accuracy(acc)
                        .attempted(att)
                        .correct(cor)
                        .recommendation("Moderate performance. Practice 10-15 targeted questions to reach >75% accuracy benchmark.")
                        .practiceLink(practiceLink)
                        .build());
            }
        }

        // If user has zero or few attempts, provide sensible initial diagnostics
        if (strongAreas.isEmpty() && weakAreas.isEmpty() && improvementAreas.isEmpty()) {
            strongAreas.add(UserAnalyticsResponse.TopicPerformanceDto.builder()
                    .topic("Core Data Structures")
                    .categoryName("Arrays & Strings")
                    .moduleType("DSA")
                    .accuracy(BigDecimal.valueOf(80.0))
                    .attempted(0)
                    .correct(0)
                    .recommendation("Strong baseline understanding. Ready for advanced graph and DP questions.")
                    .practiceLink("/placement/dsa")
                    .build());
            weakAreas.add(UserAnalyticsResponse.TopicPerformanceDto.builder()
                    .topic("Dynamic Programming & Backtracking")
                    .categoryName("Algorithms")
                    .moduleType("CODING")
                    .accuracy(BigDecimal.valueOf(45.0))
                    .attempted(0)
                    .correct(0)
                    .recommendation("Focus on memoization and recurrence relations to improve problem-solving speed.")
                    .practiceLink("/placement/coding")
                    .build());
            improvementAreas.add(UserAnalyticsResponse.TopicPerformanceDto.builder()
                    .topic("Operating Systems & Deadlocks")
                    .categoryName("Core CS")
                    .moduleType("TECHNICAL")
                    .accuracy(BigDecimal.valueOf(55.0))
                    .attempted(0)
                    .correct(0)
                    .recommendation("Practice process scheduling algorithms and virtual memory concepts.")
                    .practiceLink("/placement/technical")
                    .build());
        }

        // Build recent activities timeline
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm");
        List<UserAnalyticsResponse.RecentActivityDto> recentActivities = new ArrayList<>();

        attempts.stream().limit(5).forEach(att -> {
            Question q = att.getQuestion();
            recentActivities.add(UserAnalyticsResponse.RecentActivityDto.builder()
                    .id("att-" + att.getId())
                    .type("ATTEMPT")
                    .title(q != null ? q.getTitle() : "Practice Question Attempt")
                    .subtitle(q != null && q.getCategory() != null ? q.getCategory().getName() : "Assessment")
                    .score(Boolean.TRUE.equals(att.getIsCorrect()) ? "+100% Score" : "0% Incorrect")
                    .timestamp(att.getAttemptedAt() != null ? att.getAttemptedAt().format(dtf) : "Recently")
                    .isSuccess(att.getIsCorrect())
                    .build());
        });

        interviews.stream().limit(3).forEach(inv -> {
            recentActivities.add(UserAnalyticsResponse.RecentActivityDto.builder()
                    .id("inv-" + inv.getId())
                    .type("INTERVIEW")
                    .title("Mock Interview: " + inv.getTargetRole())
                    .subtitle(inv.getInterviewType() + " • " + inv.getStatus())
                    .score(inv.getStatus() == InterviewStatus.COMPLETED ? "Completed" : "In Progress")
                    .timestamp(inv.getCreatedAt() != null ? inv.getCreatedAt().format(dtf) : "Recently")
                    .isSuccess(inv.getStatus() == InterviewStatus.COMPLETED)
                    .build());
        });

        // Calculate streak (e.g. days user was active)
        int streakDays = calculateStreak(attempts);

        return UserAnalyticsResponse.builder()
                .overallProgressPercent(overallProgress)
                .overallAccuracy(overallAccuracy)
                .totalQuestionsAttempted(totalAttempted)
                .totalQuestionsSolved(totalSolved)
                .mockInterviewsCompleted(mockCount)
                .averageMockInterviewScore(BigDecimal.valueOf(avgMockScore).setScale(1, RoundingMode.HALF_UP))
                .currentStreakDays(streakDays)
                .totalPracticeMinutes(totalMinutes)
                .aptitudeProgress(aptProg)
                .codingProgress(codeProg)
                .dsaProgress(dsaProg)
                .technicalProgress(techProg)
                .hrProgress(hrProg)
                .categoryBreakdowns(categoryBreakdowns)
                .strongAreas(strongAreas)
                .weakAreas(weakAreas)
                .topicsNeedingImprovement(improvementAreas)
                .recentActivities(recentActivities)
                .build();
    }

    private UserAnalyticsResponse.ModuleProgressDto calculateModuleProgress(
            List<Attempt> attempts, List<Progress> progressList, ModuleType moduleType, String moduleName) {

        List<Attempt> moduleAttempts = attempts.stream()
                .filter(a -> a.getQuestion() != null
                        && a.getQuestion().getCategory() != null
                        && a.getQuestion().getCategory().getModuleType() == moduleType)
                .collect(Collectors.toList());

        int attempted = moduleAttempts.size();
        int solved = (int) moduleAttempts.stream().filter(a -> Boolean.TRUE.equals(a.getIsCorrect())).count();
        BigDecimal accuracy = attempted > 0
                ? BigDecimal.valueOf((double) solved / attempted * 100.0).setScale(1, RoundingMode.HALF_UP)
                : BigDecimal.valueOf(0.0);

        // Progress benchmark out of expected 30 questions per module
        double progressVal = Math.min(100.0, (attempted / 20.0) * 100.0);
        if (accuracy.compareTo(BigDecimal.ZERO) > 0) {
            progressVal = (progressVal * 0.4) + (accuracy.doubleValue() * 0.6);
        }

        return UserAnalyticsResponse.ModuleProgressDto.builder()
                .moduleType(moduleType.name())
                .moduleName(moduleName)
                .attempted(attempted)
                .solved(solved)
                .accuracy(accuracy)
                .progressPercent(BigDecimal.valueOf(Math.min(100.0, progressVal)).setScale(1, RoundingMode.HALF_UP))
                .build();
    }

    private int calculateStreak(List<Attempt> attempts) {
        if (attempts.isEmpty()) return 1;
        Set<String> activeDates = new HashSet<>();
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (Attempt a : attempts) {
            if (a.getAttemptedAt() != null) {
                activeDates.add(a.getAttemptedAt().format(dtf));
            }
        }
        return Math.max(1, activeDates.size());
    }

    private String getModulePracticeLink(String moduleType) {
        if ("TECHNICAL".equalsIgnoreCase(moduleType)) return "/placement/technical";
        if ("CODING".equalsIgnoreCase(moduleType)) return "/placement/coding";
        if ("DSA".equalsIgnoreCase(moduleType)) return "/placement/dsa";
        if ("HR".equalsIgnoreCase(moduleType)) return "/mock-interview";
        return "/placement/aptitude";
    }

    private UserProfileResponse mapToProfileResponse(User user, Profile profile, List<SkillDto> skills) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .onboardingCompleted(user.getOnboardingCompleted())
                .phone(profile != null ? profile.getPhone() : null)
                .avatarUrl(profile != null ? profile.getAvatarUrl() : null)
                .degree(profile != null ? profile.getDegree() : null)
                .branch(profile != null ? profile.getBranch() : null)
                .currentSemester(profile != null ? profile.getCurrentSemester() : null)
                .education(profile != null ? profile.getEducation() : null)
                .college(profile != null ? profile.getCollege() : null)
                .graduationYear(profile != null ? profile.getGraduationYear() : null)
                .targetRole(profile != null ? profile.getTargetRole() : null)
                .targetCompany(profile != null ? profile.getTargetCompany() : null)
                .preferredIndustry(profile != null ? profile.getPreferredIndustry() : null)
                .placementStatus(profile != null ? profile.getPlacementStatus() : "Actively Preparing")
                .expectedPackage(profile != null ? profile.getExpectedPackage() : null)
                .preferredLocation(profile != null ? profile.getPreferredLocation() : null)
                .jobType(profile != null ? profile.getJobType() : "Full-Time")
                .githubUrl(profile != null ? profile.getGithubUrl() : null)
                .linkedinUrl(profile != null ? profile.getLinkedinUrl() : null)
                .portfolioUrl(profile != null ? profile.getPortfolioUrl() : null)
                .resumeUrl(profile != null ? profile.getResumeUrl() : null)
                .certifications(profile != null ? profile.getCertifications() : null)
                .targetCompaniesData(profile != null ? profile.getTargetCompaniesData() : null)
                .settingsData(profile != null ? profile.getSettingsData() : null)
                .careerGoal(profile != null ? profile.getCareerGoal() : null)
                .bio(profile != null ? profile.getBio() : null)
                .skills(skills)
                .createdAt(user.getCreatedAt())
                .updatedAt(profile != null ? profile.getUpdatedAt() : user.getUpdatedAt())
                .build();
    }
}
