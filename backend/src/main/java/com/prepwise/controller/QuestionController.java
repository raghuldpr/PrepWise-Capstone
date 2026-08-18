package com.prepwise.controller;

import com.prepwise.dto.QuestionCategoryDto;
import com.prepwise.dto.QuestionDto;
import com.prepwise.entity.Difficulty;
import com.prepwise.entity.ModuleType;
import com.prepwise.entity.QuestionType;
import com.prepwise.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    @GetMapping
    public ResponseEntity<Page<QuestionDto>> getQuestions(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) ModuleType moduleType,
            @RequestParam(required = false) Difficulty difficulty,
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) QuestionType questionType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<QuestionDto> questions = questionService.getQuestions(
                categoryId, moduleType, difficulty, companyId, questionType, pageable
        );
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuestionDto> getQuestionById(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean includeAnswers
    ) {
        QuestionDto question = questionService.getQuestionById(id, includeAnswers);
        return ResponseEntity.ok(question);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<QuestionCategoryDto>> getCategories() {
        return ResponseEntity.ok(questionService.getAllCategories());
    }
}
