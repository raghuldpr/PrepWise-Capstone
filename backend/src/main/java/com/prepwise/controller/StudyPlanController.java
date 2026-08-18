package com.prepwise.controller;

import com.prepwise.dto.GenerateStudyPlanRequest;
import com.prepwise.dto.StudyPlanDto;
import com.prepwise.security.UserPrincipal;
import com.prepwise.service.StudyPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/study-plan")
@RequiredArgsConstructor
public class StudyPlanController {

    private final StudyPlanService studyPlanService;

    @PostMapping("/generate")
    public ResponseEntity<StudyPlanDto> generateStudyPlan(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody(required = false) GenerateStudyPlanRequest request) {
        StudyPlanDto studyPlan = studyPlanService.generateStudyPlan(
                userPrincipal.getId(),
                request != null ? request : new GenerateStudyPlanRequest()
        );
        return ResponseEntity.ok(studyPlan);
    }

    @GetMapping
    public ResponseEntity<List<StudyPlanDto>> getUserStudyPlans(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<StudyPlanDto> studyPlans = studyPlanService.getUserStudyPlans(userPrincipal.getId());
        return ResponseEntity.ok(studyPlans);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudyPlanDto> getStudyPlan(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("id") Long planId) {
        StudyPlanDto studyPlan = studyPlanService.getStudyPlanById(userPrincipal.getId(), planId);
        return ResponseEntity.ok(studyPlan);
    }
}
