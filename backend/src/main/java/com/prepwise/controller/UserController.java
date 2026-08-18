package com.prepwise.controller;

import com.prepwise.dto.UserProfileResponse;
import com.prepwise.security.UserPrincipal;
import com.prepwise.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final AuthService authService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getUserProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserProfileResponse profile = authService.getUserProfile(userPrincipal.getId());
        return ResponseEntity.ok(profile);
    }
}
