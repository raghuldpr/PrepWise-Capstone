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
                // Programming Languages
                Skill.builder().name("Java").category("Programming Languages").description("Core Java, OOPs concepts, Collections Framework, Multithreading, Streams, and JVM internals.").build(),
                Skill.builder().name("Python").category("Programming Languages").description("Python 3, scripting, data analysis, algorithms, and backend development with FastAPI/Django.").build(),
                Skill.builder().name("C++").category("Programming Languages").description("Modern C++, STL algorithms & containers, memory management, pointers, and competitive programming.").build(),
                Skill.builder().name("C").category("Programming Languages").description("Pointers, dynamic memory allocation (malloc/free), low-level system programming, and data structures.").build(),
                Skill.builder().name("JavaScript").category("Programming Languages").description("ES6+, asynchronous programming, closures, event loop, Promises, and DOM manipulation.").build(),
                Skill.builder().name("TypeScript").category("Programming Languages").description("Static typing, interfaces, generics, type guards, and enterprise application development.").build(),
                Skill.builder().name("SQL").category("Programming Languages").description("Complex queries, aggregations, subqueries, indexing, window functions, and schema design.").build(),

                // Core Computer Science
                Skill.builder().name("Data Structures & Algorithms").category("Core Computer Science").description("Arrays, linked lists, stacks, queues, trees, graphs, heaps, dynamic programming, and complexity analysis.").build(),
                Skill.builder().name("Operating Systems").category("Core Computer Science").description("Processes, threads, CPU scheduling, memory management, virtual memory, paging, deadlocks, and IPC.").build(),
                Skill.builder().name("Database Management Systems").category("Core Computer Science").description("Relational database design, ACID properties, normalization (1NF-BCNF), indexing, and concurrency control.").build(),
                Skill.builder().name("Computer Networks").category("Core Computer Science").description("OSI model, TCP/IP stack, routing protocols, flow control, DNS, HTTP/HTTPS, and network security.").build(),
                Skill.builder().name("System Design & Architecture").category("Core Computer Science").description("Scalable architecture, microservices, load balancing, caching (Redis), message queues, and DB partitioning.").build(),
                Skill.builder().name("Object-Oriented Programming (OOP)").category("Core Computer Science").description("Encapsulation, inheritance, polymorphism, abstraction, design patterns, and SOLID design principles.").build(),

                // Backend & Cloud Technologies
                Skill.builder().name("Spring Boot").category("Backend & Cloud").description("Enterprise REST API development, Dependency Injection, Spring Security, Spring Data JPA, and Microservices.").build(),
                Skill.builder().name("Node.js & Express").category("Backend & Cloud").description("Asynchronous event-driven backend services, RESTful APIs, middleware architecture, and JWT authentication.").build(),
                Skill.builder().name("PostgreSQL").category("Backend & Cloud").description("Advanced relational database design, indexing, transactions, JSONB querying, and SQL optimization.").build(),
                Skill.builder().name("MySQL").category("Backend & Cloud").description("Relational schema design, normalization, indexing, complex JOIN queries, and query tuning.").build(),
                Skill.builder().name("RESTful APIs").category("Backend & Cloud").description("HTTP methods, REST architectural constraints, JSON formatting, status codes, and API security.").build(),
                Skill.builder().name("Docker & Containers").category("Backend & Cloud").description("Containerization, Dockerfiles, multi-stage builds, docker-compose orchestration, and deployment.").build(),
                Skill.builder().name("Git & GitHub").category("Backend & Cloud").description("Version control workflows, branching models, pull requests, rebase/merge, and collaborative development.").build(),
                Skill.builder().name("AWS & Cloud Fundamentals").category("Backend & Cloud").description("Cloud hosting concepts, EC2, S3, RDS, Serverless compute, and basic cloud security.").build(),

                // Frontend Development
                Skill.builder().name("React.js").category("Frontend Development").description("Modern UI development, React hooks (useState, useEffect, useMemo), component lifecycle, and state management.").build(),
                Skill.builder().name("HTML5 & CSS3").category("Frontend Development").description("Semantic markup, responsive layouts, Flexbox, CSS Grid, animations, and cross-browser styling.").build(),
                Skill.builder().name("Tailwind CSS").category("Frontend Development").description("Utility-first styling, responsive UI design systems, dark mode theming, and layout utilities.").build(),

                // Aptitude & Reasoning
                Skill.builder().name("Quantitative Aptitude").category("Aptitude & Reasoning").description("Time & work, speed & distance, percentages, ratio & proportion, interest, and probability for placement exams.").build(),
                Skill.builder().name("Logical Reasoning").category("Aptitude & Reasoning").description("Syllogisms, blood relations, series completion, analytical reasoning, and coding-decoding puzzles.").build(),
                Skill.builder().name("Verbal Ability & Communication").category("Aptitude & Reasoning").description("Reading comprehension, sentence correction, technical articulation, and interview communication.").build()
        );
        return skillRepository.saveAll(defaults);
    }
}
