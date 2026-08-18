package com.prepwise.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prepwise.dto.GenerateStudyPlanRequest;
import com.prepwise.dto.StudyPlanDto;
import com.prepwise.entity.Profile;
import com.prepwise.entity.StudyPlan;
import com.prepwise.entity.User;
import com.prepwise.exception.ResourceNotFoundException;
import com.prepwise.mapper.StudyPlanMapper;
import com.prepwise.repository.ProfileRepository;
import com.prepwise.repository.StudyPlanRepository;
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
public class StudyPlanService {

    private final StudyPlanRepository studyPlanRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final AIProviderClient aiProviderClient;
    private final StudyPlanMapper studyPlanMapper;
    private final ObjectMapper objectMapper;

    @Transactional
    public StudyPlanDto generateStudyPlan(Long userId, GenerateStudyPlanRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Optional<Profile> profileOpt = profileRepository.findByUserId(userId);

        String targetRole = request != null && request.getTargetRole() != null && !request.getTargetRole().isBlank()
                ? request.getTargetRole()
                : profileOpt.map(Profile::getTargetRole).orElse("Software Engineer");

        String availableStudyTime = request != null && request.getAvailableStudyTime() != null && !request.getAvailableStudyTime().isBlank()
                ? request.getAvailableStudyTime()
                : "15 hours/week";

        String currentSkillLevel = request != null && request.getCurrentSkillLevel() != null && !request.getCurrentSkillLevel().isBlank()
                ? request.getCurrentSkillLevel()
                : "Intermediate";

        String targetDeadline = request != null && request.getTargetDeadline() != null && !request.getTargetDeadline().isBlank()
                ? request.getTargetDeadline()
                : "4 weeks";

        int durationWeeks = parseWeeks(targetDeadline);

        String systemPrompt = "You are a personal placement mentor and study scheduler. " +
                "Generate a highly structured day-by-day and week-by-week study plan for placement preparation. " +
                "Return strictly valid JSON with no markdown wrapping. The JSON structure should include: " +
                "\"title\" (string), " +
                "\"targetRole\" (string), " +
                "\"durationWeeks\" (number), " +
                "\"weeklySchedule\": [array of week objects containing \"weekNumber\", \"focusTopic\", \"dailyTasks\": [array of daily task strings], \"weeklyGoal\": string].";

        String userPrompt = String.format(
                "Candidate Context:\n- Target Role: %s\n- Available Study Time: %s\n- Current Skill Level: %s\n- Target Deadline: %s (%d weeks)\n\nGenerate an actionable, balanced study plan.",
                targetRole, availableStudyTime, currentSkillLevel, targetDeadline, durationWeeks
        );

        String aiResponse = aiProviderClient.complete(systemPrompt, userPrompt, "STUDY_PLAN_GENERATION", user);

        String cleanJson = sanitizeJson(aiResponse);

        String title = extractTitleFromJson(cleanJson, targetRole, durationWeeks);

        StudyPlan studyPlan = StudyPlan.builder()
                .user(user)
                .title(title)
                .targetRole(targetRole)
                .durationWeeks(durationWeeks)
                .planData(cleanJson)
                .build();

        studyPlan = studyPlanRepository.save(studyPlan);

        return studyPlanMapper.toDto(studyPlan);
    }

    @Transactional(readOnly = true)
    public List<StudyPlanDto> getUserStudyPlans(Long userId) {
        List<StudyPlan> studyPlans = studyPlanRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        return studyPlans.stream()
                .map(studyPlanMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StudyPlanDto getStudyPlanById(Long userId, Long planId) {
        StudyPlan studyPlan = studyPlanRepository.findByIdAndUserId(planId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Study plan not found with id: " + planId));
        return studyPlanMapper.toDto(studyPlan);
    }

    private int parseWeeks(String targetDeadline) {
        if (targetDeadline == null) return 4;
        String lower = targetDeadline.toLowerCase();
        try {
            if (lower.contains("month")) {
                String digits = lower.replaceAll("[^0-9]", "");
                if (!digits.isBlank()) {
                    return Integer.parseInt(digits) * 4;
                }
                return 4;
            }
            String digits = lower.replaceAll("[^0-9]", "");
            if (!digits.isBlank()) {
                int parsed = Integer.parseInt(digits);
                return Math.max(1, parsed);
            }
        } catch (Exception e) {
            log.debug("Error parsing weeks from deadline: {}", targetDeadline);
        }
        return 4;
    }

    private String extractTitleFromJson(String json, String defaultRole, int durationWeeks) {
        try {
            JsonNode root = objectMapper.readTree(json);
            if (root.has("title") && !root.get("title").asText().isBlank()) {
                return root.get("title").asText();
            }
        } catch (Exception e) {
            log.debug("Could not parse title from JSON response", e);
        }
        return durationWeeks + "-Week Preparation Plan for " + defaultRole;
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
