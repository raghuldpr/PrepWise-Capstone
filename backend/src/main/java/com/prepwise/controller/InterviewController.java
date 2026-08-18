package com.prepwise.controller;

import com.prepwise.dto.*;
import com.prepwise.security.UserPrincipal;
import com.prepwise.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping
    public ResponseEntity<InterviewDto> createInterview(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateInterviewRequest request) {
        InterviewDto created = interviewService.createInterview(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<InterviewDto>> getUserInterviews(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<InterviewDto> interviews = interviewService.getUserInterviews(userPrincipal.getId());
        return ResponseEntity.ok(interviews);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterviewDto> getInterview(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        InterviewDto interview = interviewService.getInterview(id, userPrincipal.getId());
        return ResponseEntity.ok(interview);
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<InterviewQuestionDto> startInterview(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        InterviewQuestionDto question = interviewService.startInterview(id, userPrincipal.getId());
        return ResponseEntity.ok(question);
    }

    @PostMapping("/{id}/answer")
    public ResponseEntity<AnswerQuestionResponse> answerQuestion(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody AnswerQuestionRequest request) {
        AnswerQuestionResponse response = interviewService.answerQuestion(id, userPrincipal.getId(), request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/coding-submit")
    public ResponseEntity<CodingSubmitResponse> submitCodingAnswer(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody CodingSubmitRequest request) {
        CodingSubmitResponse response = interviewService.submitCodingAnswer(id, userPrincipal.getId(), request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<InterviewDto> completeInterview(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        InterviewDto interview = interviewService.completeInterview(id, userPrincipal.getId());
        return ResponseEntity.ok(interview);
    }

    @GetMapping("/{id}/report")
    public ResponseEntity<InterviewReportDto> getInterviewReport(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        InterviewReportDto report = interviewService.getInterviewReport(id, userPrincipal.getId());
        return ResponseEntity.ok(report);
    }

    @GetMapping("/history")
    public ResponseEntity<InterviewHistoryResponse> getUserInterviewHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        InterviewHistoryResponse history = interviewService.getUserInterviewHistory(userPrincipal.getId(), pageable);
        return ResponseEntity.ok(history);
    }
}
