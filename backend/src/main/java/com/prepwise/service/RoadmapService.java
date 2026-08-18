package com.prepwise.service;

import com.prepwise.dto.GenerateRoadmapRequest;
import com.prepwise.dto.LearningRoadmapDto;
import com.prepwise.entity.LearningRoadmap;
import com.prepwise.entity.Profile;
import com.prepwise.entity.User;
import com.prepwise.exception.ResourceNotFoundException;
import com.prepwise.mapper.LearningRoadmapMapper;
import com.prepwise.repository.LearningRoadmapRepository;
import com.prepwise.repository.ProfileRepository;
import com.prepwise.repository.UserRepository;
import com.prepwise.service.ai.AIProviderClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoadmapService {

    private final LearningRoadmapRepository learningRoadmapRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final AIProviderClient aiProviderClient;
    private final LearningRoadmapMapper learningRoadmapMapper;

    @Transactional
    public LearningRoadmapDto generateRoadmap(Long userId, GenerateRoadmapRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Optional<Profile> profileOpt = profileRepository.findByUserId(userId);

        String targetRole = request != null && request.getTargetRole() != null && !request.getTargetRole().isBlank()
                ? request.getTargetRole()
                : profileOpt.map(Profile::getTargetRole).orElse("Software Engineer");

        String targetTechnology = request != null && request.getTargetTechnology() != null && !request.getTargetTechnology().isBlank()
                ? request.getTargetTechnology()
                : "Java, Spring Boot, React, Data Structures & Algorithms";

        String systemPrompt = "You are an expert tech career strategist and curriculum architect. " +
                "Generate a detailed, step-by-step learning roadmap for a student aspiring to become a " + targetRole + " using " + targetTechnology + ". " +
                "Return strictly valid JSON with no markdown wrapping. The JSON structure should include: " +
                "\"targetRole\" (string), " +
                "\"targetTechnology\" (string), " +
                "\"estimatedDurationWeeks\" (number), " +
                "\"phases\": [array of phase objects with \"phaseNumber\", \"phaseTitle\", \"durationWeeks\", \"topics\": [array of topics], \"milestones\": [array of milestones], \"recommendedResources\": [array of resources]].";

        String userPrompt = String.format(
                "Create a comprehensive placement preparation roadmap for:\nRole: %s\nTechnologies/Skills: %s\nMake it structured, realistic, and highly detailed.",
                targetRole, targetTechnology
        );

        String aiResponse = aiProviderClient.complete(systemPrompt, userPrompt, "ROADMAP_GENERATION", user);

        String cleanJson = sanitizeJson(aiResponse);

        LearningRoadmap roadmap = LearningRoadmap.builder()
                .user(user)
                .targetRole(targetRole)
                .roadmapData(cleanJson)
                .build();

        roadmap = learningRoadmapRepository.save(roadmap);

        return learningRoadmapMapper.toDto(roadmap);
    }

    @Transactional(readOnly = true)
    public List<LearningRoadmapDto> getUserRoadmaps(Long userId) {
        List<LearningRoadmap> roadmaps = learningRoadmapRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        return roadmaps.stream()
                .map(learningRoadmapMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LearningRoadmapDto getRoadmapById(Long userId, Long roadmapId) {
        LearningRoadmap roadmap = learningRoadmapRepository.findByIdAndUserId(roadmapId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap not found with id: " + roadmapId));
        return learningRoadmapMapper.toDto(roadmap);
    }

    private String sanitizeJson(String json) {
        if (json == null) return "{}";
        String clean = json.trim();
        if (clean.startsWith("```json")) {
            clean = clean.substring(7);
        } else if (clean.startsWith("```")) {
            clean = clean.substring(3);
        }
        if (clean.endsWith("```")) {
            clean = clean.substring(0, clean.length() - 3);
        }
        return clean.trim();
    }
}
