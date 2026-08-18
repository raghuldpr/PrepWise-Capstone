package com.prepwise.controller;

import com.prepwise.dto.GenerateRoadmapRequest;
import com.prepwise.dto.LearningRoadmapDto;
import com.prepwise.security.UserPrincipal;
import com.prepwise.service.RoadmapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roadmap")
@RequiredArgsConstructor
public class RoadmapController {

    private final RoadmapService roadmapService;

    @PostMapping("/generate")
    public ResponseEntity<LearningRoadmapDto> generateRoadmap(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody(required = false) GenerateRoadmapRequest request) {
        LearningRoadmapDto roadmap = roadmapService.generateRoadmap(
                userPrincipal.getId(),
                request != null ? request : new GenerateRoadmapRequest()
        );
        return ResponseEntity.ok(roadmap);
    }

    @GetMapping
    public ResponseEntity<List<LearningRoadmapDto>> getUserRoadmaps(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<LearningRoadmapDto> roadmaps = roadmapService.getUserRoadmaps(userPrincipal.getId());
        return ResponseEntity.ok(roadmaps);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LearningRoadmapDto> getRoadmap(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("id") Long roadmapId) {
        LearningRoadmapDto roadmap = roadmapService.getRoadmapById(userPrincipal.getId(), roadmapId);
        return ResponseEntity.ok(roadmap);
    }
}
