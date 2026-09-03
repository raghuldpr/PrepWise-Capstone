package com.prepwise.controller;

import com.prepwise.dto.*;
import com.prepwise.security.UserPrincipal;
import com.prepwise.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getUserProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserProfileResponse profile = userService.getUserProfile(userPrincipal.getId());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateUserProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody UpdateProfileRequest request) {
        UserProfileResponse profile = userService.updateUserProfile(userPrincipal.getId(), request);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/settings")
    public ResponseEntity<Map<String, Object>> getUserSettings(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Map<String, Object> settings = userService.getUserSettings(userPrincipal.getId());
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/settings")
    public ResponseEntity<Map<String, Object>> updateUserSettings(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody UpdateSettingsRequest request) {
        Map<String, Object> response = userService.updateUserSettings(userPrincipal.getId(), request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(userPrincipal.getId(), request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @GetMapping("/analytics")
    public ResponseEntity<UserAnalyticsResponse> getUserAnalytics(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserAnalyticsResponse analytics = userService.getUserAnalytics(userPrincipal.getId());
        return ResponseEntity.ok(analytics);
    }
}
