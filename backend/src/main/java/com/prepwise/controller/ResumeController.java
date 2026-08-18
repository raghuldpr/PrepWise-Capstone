package com.prepwise.controller;

import com.prepwise.dto.ResumeAnalysisDto;
import com.prepwise.dto.ResumeDto;
import com.prepwise.security.UserPrincipal;
import com.prepwise.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping("/upload")
    public ResponseEntity<ResumeDto> uploadResume(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam("file") MultipartFile file) {
        ResumeDto resumeDto = resumeService.uploadResume(userPrincipal.getId(), file);
        return ResponseEntity.ok(resumeDto);
    }

    @PostMapping("/{id}/analyze")
    public ResponseEntity<ResumeAnalysisDto> analyzeResume(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("id") Long resumeId) {
        ResumeAnalysisDto analysisDto = resumeService.analyzeResume(userPrincipal.getId(), resumeId);
        return ResponseEntity.ok(analysisDto);
    }

    @GetMapping("/{id}/analysis")
    public ResponseEntity<ResumeAnalysisDto> getResumeAnalysis(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("id") Long resumeId) {
        ResumeAnalysisDto analysisDto = resumeService.getResumeAnalysis(userPrincipal.getId(), resumeId);
        return ResponseEntity.ok(analysisDto);
    }

    @GetMapping
    public ResponseEntity<List<ResumeDto>> getUserResumes(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<ResumeDto> resumes = resumeService.getUserResumes(userPrincipal.getId());
        return ResponseEntity.ok(resumes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResumeDto> getResume(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("id") Long resumeId) {
        ResumeDto resume = resumeService.getResume(userPrincipal.getId(), resumeId);
        return ResponseEntity.ok(resume);
    }
}
