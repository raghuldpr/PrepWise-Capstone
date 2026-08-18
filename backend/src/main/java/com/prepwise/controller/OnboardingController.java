package com.prepwise.controller;

import com.prepwise.dto.SaveGoalsRequest;
import com.prepwise.dto.SaveSkillsRequest;
import com.prepwise.dto.UserProfileResponse;
import com.prepwise.security.UserPrincipal;
import com.prepwise.service.OnboardingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/onboarding")
@RequiredArgsConstructor
public class OnboardingController {

    private final OnboardingService onboardingService;

    @PostMapping("/skills")
    public ResponseEntity<?> saveSkills(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody SaveSkillsRequest request) {
        onboardingService.saveUserSkills(userPrincipal.getId(), request);
        return ResponseEntity.ok(Map.of("message", "Skills saved successfully"));
    }

    @PostMapping("/goals")
    public ResponseEntity<UserProfileResponse> saveGoals(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody SaveGoalsRequest request) {
        UserProfileResponse response = onboardingService.saveUserGoals(userPrincipal.getId(), request);
        return ResponseEntity.ok(response);
    }
}
