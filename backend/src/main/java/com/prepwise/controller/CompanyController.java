package com.prepwise.controller;

import com.prepwise.dto.CompanyDto;
import com.prepwise.dto.CompanyPreparationDto;
import com.prepwise.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final QuestionService questionService;

    @GetMapping
    public ResponseEntity<List<CompanyDto>> getCompanies() {
        return ResponseEntity.ok(questionService.getAllCompanies());
    }

    @GetMapping("/{id}/preparation")
    public ResponseEntity<CompanyPreparationDto> getCompanyPreparation(@PathVariable Long id) {
        CompanyPreparationDto prepData = questionService.getCompanyPreparation(id);
        return ResponseEntity.ok(prepData);
    }
}
