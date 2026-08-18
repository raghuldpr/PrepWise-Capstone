package com.prepwise.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prepwise.dto.ProjectRecommendationDto;
import com.prepwise.dto.ProjectRecommendationRequest;
import com.prepwise.dto.UserProjectDto;
import com.prepwise.entity.*;
import com.prepwise.exception.ResourceNotFoundException;
import com.prepwise.mapper.UserProjectMapper;
import com.prepwise.repository.ProjectRepository;
import com.prepwise.repository.UserProjectRepository;
import com.prepwise.repository.UserRepository;
import com.prepwise.service.ai.AIProviderClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserProjectRepository userProjectRepository;
    private final UserRepository userRepository;
    private final AIProviderClient aiProviderClient;
    private final UserProjectMapper userProjectMapper;
    private final ObjectMapper objectMapper;

    @Transactional
    public List<ProjectRecommendationDto> recommendProjects(Long userId, ProjectRecommendationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        String language = request.getLanguage() != null && !request.getLanguage().isBlank() ? request.getLanguage() : "Java / Python / JavaScript";
        String domain = request.getDomain() != null && !request.getDomain().isBlank() ? request.getDomain() : "Web Development / AI / Cloud";
        String difficultyStr = request.getDifficulty() != null && !request.getDifficulty().isBlank() ? request.getDifficulty() : "MEDIUM";
        boolean fullStack = Boolean.TRUE.equals(request.getFullStackRequired());
        String careerGoal = request.getCareerGoal() != null && !request.getCareerGoal().isBlank() ? request.getCareerGoal() : "Software Engineer";

        String systemPrompt = "You are an expert technical hiring manager and software engineering mentor. " +
                "Generate 3 distinct, highly relevant industry-level project recommendations for candidate preparation. " +
                "Return ONLY a valid JSON array of project objects without any prose or explanation. " +
                "Each project object MUST contain the following keys: " +
                "\"title\" (string), " +
                "\"problemStatement\" (string), " +
                "\"techStack\" (string), " +
                "\"difficulty\" (EASY, MEDIUM, or HARD), " +
                "\"skillsCovered\" (string), " +
                "\"placementRelevance\" (string), " +
                "\"whyItsUseful\" (string), " +
                "\"roadmap\" (string), " +
                "\"futureEnhancements\" (string).";

        String userPrompt = String.format(
                "Candidate Preferences:\n- Programming Language: %s\n- Domain: %s\n- Targeted Difficulty: %s\n- FullStack Required: %s\n- Career Goal: %s\n\nGenerate 3 realistic, portfolio-ready project ideas.",
                language, domain, difficultyStr, fullStack, careerGoal
        );

        String aiResponse = aiProviderClient.complete(systemPrompt, userPrompt, "PROJECT_RECOMMENDATION", user);

        List<ProjectRecommendationDto> recommendations = parseAndSaveProjects(aiResponse, domain);

        if (recommendations.isEmpty()) {
            // Fallback recommendation if AI format could not be parsed
            Project fallback = Project.builder()
                    .title("Placement Management & Analytics Portal")
                    .description("A comprehensive web portal for tracking campus placement drives, student applications, company eligibility criteria, and analytics.")
                    .difficulty(Difficulty.MEDIUM)
                    .domain(domain)
                    .technologyStack(language + ", React/Vue, Spring Boot/Node, PostgreSQL/MySQL")
                    .skillsCovered("REST API Design, Database Normalization, JWT Auth, Analytics Dashboard")
                    .placementRelevance("High relevance for Software Engineering and Full Stack Developer roles.")
                    .developmentRoadmap("Phase 1: DB Schema & Auth. Phase 2: Drive Management. Phase 3: Analytics & Export.")
                    .build();
            fallback = projectRepository.save(fallback);

            recommendations.add(ProjectRecommendationDto.builder()
                    .id(fallback.getId())
                    .title(fallback.getTitle())
                    .problemStatement(fallback.getDescription())
                    .description(fallback.getDescription())
                    .techStack(fallback.getTechnologyStack())
                    .technologyStack(fallback.getTechnologyStack())
                    .difficulty(fallback.getDifficulty())
                    .skillsCovered(fallback.getSkillsCovered())
                    .placementRelevance(fallback.getPlacementRelevance())
                    .whyItsUseful("Demonstrates production-level CRUD, state management, and relational database skills.")
                    .roadmap(fallback.getDevelopmentRoadmap())
                    .developmentRoadmap(fallback.getDevelopmentRoadmap())
                    .futureEnhancements("Add AI Resume Screening and automated notification service.")
                    .build());
        }

        return recommendations;
    }

    @Transactional(readOnly = true)
    public ProjectRecommendationDto getProjectById(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        String fullDescription = project.getDescription();
        String problemStatement = fullDescription != null ? fullDescription : "";
        String whyItsUseful = "";
        String futureEnhancements = "";

        if (fullDescription != null && fullDescription.contains("\n\nWhy It's Useful:\n")) {
            String[] parts = fullDescription.split("\n\nWhy It's Useful:\n");
            problemStatement = parts[0];
            if (parts.length > 1) {
                if (parts[1].contains("\n\nFuture Enhancements:\n")) {
                    String[] subParts = parts[1].split("\n\nFuture Enhancements:\n");
                    whyItsUseful = subParts[0];
                    if (subParts.length > 1) futureEnhancements = subParts[1];
                } else {
                    whyItsUseful = parts[1];
                }
            }
        }

        return ProjectRecommendationDto.builder()
                .id(project.getId())
                .title(project.getTitle())
                .problemStatement(problemStatement)
                .description(problemStatement)
                .techStack(project.getTechnologyStack())
                .technologyStack(project.getTechnologyStack())
                .difficulty(project.getDifficulty())
                .skillsCovered(project.getSkillsCovered())
                .placementRelevance(project.getPlacementRelevance())
                .whyItsUseful(whyItsUseful.isBlank() ? "Provides hands-on experience building production-ready architectures." : whyItsUseful)
                .roadmap(project.getDevelopmentRoadmap())
                .developmentRoadmap(project.getDevelopmentRoadmap())
                .futureEnhancements(futureEnhancements.isBlank() ? "Implement CI/CD pipeline, performance monitoring, and containerization." : futureEnhancements)
                .build();
    }

    @Transactional
    public UserProjectDto saveProjectForUser(Long userId, Long projectId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        UserProject userProject = userProjectRepository.findByUserIdAndProjectId(userId, projectId)
                .orElseGet(() -> UserProject.builder()
                        .user(user)
                        .project(project)
                        .status(UserProjectStatus.SAVED)
                        .build());

        userProject.setStatus(UserProjectStatus.SAVED);
        userProject = userProjectRepository.save(userProject);

        return userProjectMapper.toDto(userProject);
    }

    @Transactional(readOnly = true)
    public List<UserProjectDto> getUserProjects(Long userId) {
        List<UserProject> userProjects = userProjectRepository.findByUserId(userId);
        return userProjects.stream()
                .map(userProjectMapper::toDto)
                .collect(Collectors.toList());
    }

    private List<ProjectRecommendationDto> parseAndSaveProjects(String aiResponse, String fallbackDomain) {
        List<ProjectRecommendationDto> list = new ArrayList<>();
        try {
            String cleanJson = aiResponse.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
            } else if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.substring(3);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            }
            cleanJson = cleanJson.trim();

            JsonNode root = objectMapper.readTree(cleanJson);
            JsonNode arrayNode = root;
            if (!root.isArray()) {
                if (root.has("projects")) {
                    arrayNode = root.get("projects");
                } else if (root.has("recommendations")) {
                    arrayNode = root.get("recommendations");
                }
            }

            if (arrayNode != null && arrayNode.isArray()) {
                for (JsonNode item : arrayNode) {
                    String title = item.path("title").asText("Custom Project");
                    String problemStatement = item.path("problemStatement").asText(item.path("description").asText(""));
                    String techStack = item.path("techStack").asText(item.path("technologyStack").asText("Java, Spring Boot, React"));
                    String diffStr = item.path("difficulty").asText("MEDIUM").toUpperCase();
                    Difficulty difficulty = parseDifficulty(diffStr);
                    String skillsCovered = item.path("skillsCovered").asText("");
                    String placementRelevance = item.path("placementRelevance").asText("");
                    String whyItsUseful = item.path("whyItsUseful").asText("");
                    String roadmap = item.path("roadmap").asText(item.path("developmentRoadmap").asText(""));
                    String futureEnhancements = item.path("futureEnhancements").asText("");

                    String fullDescription = problemStatement;
                    if (!whyItsUseful.isBlank()) {
                        fullDescription += "\n\nWhy It's Useful:\n" + whyItsUseful;
                    }
                    if (!futureEnhancements.isBlank()) {
                        fullDescription += "\n\nFuture Enhancements:\n" + futureEnhancements;
                    }

                    Project project = Project.builder()
                            .title(title)
                            .description(fullDescription)
                            .difficulty(difficulty)
                            .domain(fallbackDomain)
                            .technologyStack(techStack)
                            .skillsCovered(skillsCovered)
                            .placementRelevance(placementRelevance)
                            .developmentRoadmap(roadmap)
                            .build();

                    project = projectRepository.save(project);

                    ProjectRecommendationDto dto = ProjectRecommendationDto.builder()
                            .id(project.getId())
                            .title(title)
                            .problemStatement(problemStatement)
                            .description(problemStatement)
                            .techStack(techStack)
                            .technologyStack(techStack)
                            .difficulty(difficulty)
                            .skillsCovered(skillsCovered)
                            .placementRelevance(placementRelevance)
                            .whyItsUseful(whyItsUseful)
                            .roadmap(roadmap)
                            .developmentRoadmap(roadmap)
                            .futureEnhancements(futureEnhancements)
                            .build();

                    list.add(dto);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse project recommendations JSON from AI response: {}", e.getMessage());
        }
        return list;
    }

    private Difficulty parseDifficulty(String str) {
        if (str == null) return Difficulty.MEDIUM;
        try {
            return Difficulty.valueOf(str.trim().toUpperCase());
        } catch (Exception e) {
            if (str.toUpperCase().contains("EASY") || str.toUpperCase().contains("BEGINNER")) return Difficulty.EASY;
            if (str.toUpperCase().contains("HARD") || str.toUpperCase().contains("ADVANCED")) return Difficulty.HARD;
            return Difficulty.MEDIUM;
        }
    }
}
