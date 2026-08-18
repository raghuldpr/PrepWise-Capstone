package com.prepwise.controller;

import com.prepwise.dto.AttemptDto;
import com.prepwise.dto.AttemptRequestDto;
import com.prepwise.dto.AttemptResultDto;
import com.prepwise.security.UserPrincipal;
import com.prepwise.service.AttemptService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attempts")
@RequiredArgsConstructor
public class AttemptController {

    private final AttemptService attemptService;

    @PostMapping
    public ResponseEntity<AttemptResultDto> submitAttempt(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody AttemptRequestDto request
    ) {
        AttemptResultDto result = attemptService.submitAttempt(userPrincipal.getId(), request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<AttemptDto>> getRecentAttempts(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        List<AttemptDto> attempts = attemptService.getUserRecentAttempts(userPrincipal.getId());
        return ResponseEntity.ok(attempts);
    }
}
