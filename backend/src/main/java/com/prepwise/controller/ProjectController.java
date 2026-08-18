package com.prepwise.controller;

import com.prepwise.dto.ProjectRecommendationDto;
import com.prepwise.dto.ProjectRecommendationRequest;
import com.prepwise.dto.UserProjectDto;
import com.prepwise.security.UserPrincipal;
import com.prepwise.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping("/recommend")
    public ResponseEntity<List<ProjectRecommendationDto>> recommendProjects(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody(required = false) ProjectRecommendationRequest request) {
        List<ProjectRecommendationDto> recommendations = projectService.recommendProjects(
                userPrincipal.getId(),
                request != null ? request : new ProjectRecommendationRequest()
        );
        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectRecommendationDto> getProjectById(@PathVariable("id") Long projectId) {
        ProjectRecommendationDto project = projectService.getProjectById(projectId);
        return ResponseEntity.ok(project);
    }

    @PostMapping("/{id}/save")
    public ResponseEntity<UserProjectDto> saveProject(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("id") Long projectId) {
        UserProjectDto savedUserProject = projectService.saveProjectForUser(userPrincipal.getId(), projectId);
        return ResponseEntity.ok(savedUserProject);
    }

    @GetMapping("/saved")
    public ResponseEntity<List<UserProjectDto>> getSavedProjects(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<UserProjectDto> projects = projectService.getUserProjects(userPrincipal.getId());
        return ResponseEntity.ok(projects);
    }
}
