package com.prepwise.controller;

import com.prepwise.dto.SkillDto;
import com.prepwise.dto.SkillGapAnalysisRequest;
import com.prepwise.dto.SkillGapAnalysisResponse;
import com.prepwise.security.UserPrincipal;
import com.prepwise.service.OnboardingService;
import com.prepwise.service.SkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
public class SkillController {

    private final OnboardingService onboardingService;
    private final SkillService skillService;

    @GetMapping
    public ResponseEntity<List<SkillDto>> getAllSkills() {
        List<SkillDto> skills = onboardingService.getAllSkills();
        return ResponseEntity.ok(skills);
    }

    @PostMapping("/analyze")
    public ResponseEntity<SkillGapAnalysisResponse> analyzeSkills(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody(required = false) SkillGapAnalysisRequest request) {
        SkillGapAnalysisResponse response = skillService.analyzeSkills(
                userPrincipal.getId(),
                request != null ? request : new SkillGapAnalysisRequest()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/gap-analysis")
    public ResponseEntity<SkillGapAnalysisResponse> getLatestGapAnalysis(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return skillService.getLatestAnalysis(userPrincipal.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

