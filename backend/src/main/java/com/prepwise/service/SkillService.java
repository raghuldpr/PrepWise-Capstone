package com.prepwise.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prepwise.dto.SkillGapAnalysisRequest;
import com.prepwise.dto.SkillGapAnalysisResponse;
import com.prepwise.entity.*;
import com.prepwise.exception.ResourceNotFoundException;
import com.prepwise.repository.ProfileRepository;
import com.prepwise.repository.SkillGapAnalysisRepository;
import com.prepwise.repository.UserRepository;
import com.prepwise.repository.UserSkillRepository;
import com.prepwise.service.ai.AIProviderClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SkillService {

    private final UserSkillRepository userSkillRepository;
    private final SkillGapAnalysisRepository skillGapAnalysisRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final AIProviderClient aiProviderClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public SkillGapAnalysisResponse analyzeSkills(Long userId, SkillGapAnalysisRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Determine target role
        String targetRole = request != null && request.getTargetRole() != null && !request.getTargetRole().isBlank()
                ? request.getTargetRole()
                : profileRepository.findByUserId(userId).map(Profile::getTargetRole).orElse("Software Engineer");

        if (targetRole == null || targetRole.isBlank()) {
            targetRole = "Software Engineer";
        }

        // Fetch user's current skills
        List<UserSkill> userSkills = userSkillRepository.findByUserId(userId);
        String userSkillsSummary;
        if (userSkills.isEmpty()) {
            userSkillsSummary = "No current skills recorded in profile yet.";
        } else {
            userSkillsSummary = userSkills.stream()
                    .map(us -> us.getSkill().getName() + " (" + us.getProficiencyLevel() + ")")
                    .collect(Collectors.joining(", "));
        }

        String systemPrompt = "You are an expert technical career advisor and hiring lead. " +
                "Analyze the candidate's current skills against typical requirements for the role of: " + targetRole + ". " +
                "Return ONLY a valid JSON object with strictly these keys:\n" +
                "\"existingStrengths\": [array of string skills user possesses that match requirements],\n" +
                "\"missingSkills\": [array of string essential skills required for the role that user lacks],\n" +
                "\"skillsToImprove\": [array of string skills user has but needs higher proficiency in],\n" +
                "\"recommendedLearningOrder\": [array of string step-by-step topics/skills to learn in order].\n" +
                "Do not wrap in markdown or prose if possible.";

        String userPrompt = "TARGET ROLE: " + targetRole + "\nCANDIDATE CURRENT SKILLS:\n" + userSkillsSummary;

        String aiResponse = aiProviderClient.complete(systemPrompt, userPrompt, "SKILL_GAP_ANALYSIS", user);

        ParsedSkillAnalysis parsed = parseAiResponse(aiResponse);

        // Build recommendations JSON or text for persistence
        String existingSkillsStr = String.join(", ", parsed.existingStrengths);
        String missingSkillsStr = String.join(", ", parsed.missingSkills);

        String recommendationsCombined;
        try {
            recommendationsCombined = objectMapper.writeValueAsString(parsed);
        } catch (Exception e) {
            recommendationsCombined = "Skills to improve: " + String.join(", ", parsed.skillsToImprove) +
                    "\nRecommended learning order: " + String.join(" -> ", parsed.recommendedLearningOrder);
        }

        SkillGapAnalysis analysis = SkillGapAnalysis.builder()
                .user(user)
                .targetRole(targetRole)
                .existingSkills(existingSkillsStr)
                .missingSkills(missingSkillsStr)
                .recommendations(recommendationsCombined)
                .build();

        analysis = skillGapAnalysisRepository.save(analysis);

        return SkillGapAnalysisResponse.builder()
                .id(analysis.getId())
                .targetRole(targetRole)
                .existingStrengths(parsed.existingStrengths)
                .missingSkills(parsed.missingSkills)
                .skillsToImprove(parsed.skillsToImprove)
                .recommendedLearningOrder(parsed.recommendedLearningOrder)
                .createdAt(analysis.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public Optional<SkillGapAnalysisResponse> getLatestAnalysis(Long userId) {
        return skillGapAnalysisRepository.findFirstByUserIdOrderByCreatedAtDesc(userId)
                .map(analysis -> {
                    ParsedSkillAnalysis parsed = parseStoredRecommendations(analysis.getRecommendations(), analysis.getExistingSkills(), analysis.getMissingSkills());
                    return SkillGapAnalysisResponse.builder()
                            .id(analysis.getId())
                            .targetRole(analysis.getTargetRole())
                            .existingStrengths(parsed.existingStrengths)
                            .missingSkills(parsed.missingSkills)
                            .skillsToImprove(parsed.skillsToImprove)
                            .recommendedLearningOrder(parsed.recommendedLearningOrder)
                            .createdAt(analysis.getCreatedAt())
                            .build();
                });
    }

    private ParsedSkillAnalysis parseAiResponse(String aiResponse) {
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

            List<String> existingStrengths = extractList(root.path("existingStrengths"));
            List<String> missingSkills = extractList(root.path("missingSkills"));
            List<String> skillsToImprove = extractList(root.path("skillsToImprove"));
            List<String> learningOrder = extractList(root.path("recommendedLearningOrder"));

            return new ParsedSkillAnalysis(existingStrengths, missingSkills, skillsToImprove, learningOrder);
        } catch (Exception e) {
            log.warn("Failed to parse skill gap analysis JSON from AI response: {}. Using fallback.", e.getMessage());
            return new ParsedSkillAnalysis(
                    List.of("Core Programming Fundamentals"),
                    List.of("System Design", "Cloud Architecture & DevOps"),
                    List.of("Data Structures & Algorithms", "Database Management & SQL"),
                    List.of("1. Data Structures & Algorithms", "2. System Design", "3. SQL & Database Optimization", "4. Mock Technical Interviews")
            );
        }
    }

    private ParsedSkillAnalysis parseStoredRecommendations(String storedRecommendations, String existingSkillsStr, String missingSkillsStr) {
        try {
            if (storedRecommendations != null && storedRecommendations.startsWith("{")) {
                JsonNode root = objectMapper.readTree(storedRecommendations);
                return new ParsedSkillAnalysis(
                        extractList(root.path("existingStrengths")),
                        extractList(root.path("missingSkills")),
                        extractList(root.path("skillsToImprove")),
                        extractList(root.path("recommendedLearningOrder"))
                );
            }
        } catch (Exception e) {
            log.debug("Could not parse stored recommendations as JSON", e);
        }

        List<String> existing = existingSkillsStr != null ? Arrays.asList(existingSkillsStr.split("\\s*,\\s*")) : List.of();
        List<String> missing = missingSkillsStr != null ? Arrays.asList(missingSkillsStr.split("\\s*,\\s*")) : List.of();

        return new ParsedSkillAnalysis(
                existing,
                missing,
                List.of("Advanced System Design", "Database Query Tuning"),
                List.of("1. Core Computer Science Concepts", "2. Problem Solving", "3. System Architecture")
        );
    }

    private List<String> extractList(JsonNode node) {
        List<String> list = new ArrayList<>();
        if (node.isArray()) {
            for (JsonNode item : node) {
                if (item.isTextual() && !item.asText().isBlank()) {
                    list.add(item.asText());
                }
            }
        } else if (node.isTextual() && !node.asText().isBlank()) {
            list.add(node.asText());
        }
        return list;
    }

    public static class ParsedSkillAnalysis {
        public List<String> existingStrengths;
        public List<String> missingSkills;
        public List<String> skillsToImprove;
        public List<String> recommendedLearningOrder;

        public ParsedSkillAnalysis(List<String> existingStrengths, List<String> missingSkills,
                                    List<String> skillsToImprove, List<String> recommendedLearningOrder) {
            this.existingStrengths = existingStrengths != null ? existingStrengths : new ArrayList<>();
            this.missingSkills = missingSkills != null ? missingSkills : new ArrayList<>();
            this.skillsToImprove = skillsToImprove != null ? skillsToImprove : new ArrayList<>();
            this.recommendedLearningOrder = recommendedLearningOrder != null ? recommendedLearningOrder : new ArrayList<>();
        }
    }
}
