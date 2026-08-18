package com.prepwise.controller;

import com.prepwise.dto.ProgressDto;
import com.prepwise.security.UserPrincipal;
import com.prepwise.service.AttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final AttemptService attemptService;

    @GetMapping
    public ResponseEntity<List<ProgressDto>> getProgress(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        List<ProgressDto> progressList = attemptService.getUserProgress(userPrincipal.getId());
        return ResponseEntity.ok(progressList);
    }

    @GetMapping("/weak-areas")
    public ResponseEntity<List<ProgressDto>> getWeakAreas(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "60.00") BigDecimal threshold
    ) {
        List<ProgressDto> weakAreas = attemptService.getWeakAreas(userPrincipal.getId(), threshold);
        return ResponseEntity.ok(weakAreas);
    }

    @GetMapping("/{categoryId}")
    public ResponseEntity<ProgressDto> getProgressByCategoryId(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long categoryId
    ) {
        ProgressDto progress = attemptService.getUserProgressByCategoryId(userPrincipal.getId(), categoryId);
        return ResponseEntity.ok(progress);
    }
}
