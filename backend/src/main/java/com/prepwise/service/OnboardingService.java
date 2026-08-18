package com.prepwise.service;

import com.prepwise.dto.*;
import com.prepwise.entity.*;
import com.prepwise.exception.ResourceNotFoundException;
import com.prepwise.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OnboardingService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;

    @Transactional
    public List<SkillDto> getAllSkills() {
        List<Skill> skills = skillRepository.findAll();

        if (skills.isEmpty()) {
            skills = seedDefaultSkills();
        }

        return skills.stream()
                .map(skill -> SkillDto.builder()
                        .id(skill.getId())
                        .name(skill.getName())
                        .category(skill.getCategory())
                        .description(skill.getDescription())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void saveUserSkills(Long userId, SaveSkillsRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        userSkillRepository.deleteByUserId(userId);

        List<UserSkill> userSkills = new ArrayList<>();
        for (UserSkillSelectionDto selection : request.getSkills()) {
            Skill skill = skillRepository.findById(selection.getSkillId())
                    .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + selection.getSkillId()));

            UserSkill userSkill = UserSkill.builder()
                    .user(user)
                    .skill(skill)
                    .proficiencyLevel(selection.getProficiencyLevel() != null ? selection.getProficiencyLevel() : ProficiencyLevel.BEGINNER)
                    .build();

            userSkills.add(userSkill);
        }

        userSkillRepository.saveAll(userSkills);
    }

    @Transactional
    public UserProfileResponse saveUserGoals(Long userId, SaveGoalsRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Profile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> Profile.builder().user(user).build());

        profile.setTargetRole(request.getTargetRole());
        if (request.getTargetCompany() != null) profile.setTargetCompany(request.getTargetCompany());
        if (request.getCareerGoal() != null) profile.setCareerGoal(request.getCareerGoal());
        if (request.getEducation() != null) profile.setEducation(request.getEducation());
        if (request.getCollege() != null) profile.setCollege(request.getCollege());
        if (request.getGraduationYear() != null) profile.setGraduationYear(request.getGraduationYear());
        if (request.getBio() != null) profile.setBio(request.getBio());

        profileRepository.save(profile);

        user.setOnboardingCompleted(true);
        userRepository.save(user);

        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .onboardingCompleted(user.getOnboardingCompleted())
                .education(profile.getEducation())
                .college(profile.getCollege())
                .graduationYear(profile.getGraduationYear())
                .targetRole(profile.getTargetRole())
                .targetCompany(profile.getTargetCompany())
                .careerGoal(profile.getCareerGoal())
                .bio(profile.getBio())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private List<Skill> seedDefaultSkills() {
        List<Skill> defaults = List.of(
                Skill.builder().name("Java").category("Programming").description("Object-oriented programming language").build(),
                Skill.builder().name("Python").category("Programming").description("High-level general-purpose programming language").build(),
                Skill.builder().name("C++").category("Programming").description("Performance-focused system programming language").build(),
                Skill.builder().name("Data Structures & Algorithms").category("Core CS").description("Arrays, Trees, Graphs, Sorting, Dynamic Programming").build(),
                Skill.builder().name("System Design").category("Core CS").description("Scalable architectures, load balancing, caching, databases").build(),
                Skill.builder().name("Database Management & SQL").category("Core CS").description("Relational databases, indexing, normalization, queries").build(),
                Skill.builder().name("Operating Systems").category("Core CS").description("Processes, threads, memory management, file systems").build(),
                Skill.builder().name("Computer Networks").category("Core CS").description("TCP/IP, HTTP/S, DNS, routing, OSI model").build(),
                Skill.builder().name("React.js").category("Web Development").description("Frontend UI library for modern web applications").build(),
                Skill.builder().name("Spring Boot").category("Web Development").description("Java-based enterprise framework for REST APIs").build(),
                Skill.builder().name("Quantitative Aptitude").category("Aptitude").description("Numerical ability, ratios, probability, logic").build(),
                Skill.builder().name("Logical Reasoning").category("Aptitude").description("Analytical puzzles, series, deductions").build(),
                Skill.builder().name("Verbal & Communication").category("Soft Skills").description("Grammar, comprehension, articulate expression").build()
        );
        return skillRepository.saveAll(defaults);
    }
}
