package com.prepwise.service;

import com.prepwise.dto.CompanyDto;
import com.prepwise.dto.CompanyPreparationDto;
import com.prepwise.dto.QuestionCategoryDto;
import com.prepwise.dto.QuestionDto;
import com.prepwise.entity.Company;
import com.prepwise.entity.Difficulty;
import com.prepwise.entity.ModuleType;
import com.prepwise.entity.Question;
import com.prepwise.entity.QuestionType;
import com.prepwise.exception.ResourceNotFoundException;
import com.prepwise.mapper.CompanyMapper;
import com.prepwise.mapper.QuestionCategoryMapper;
import com.prepwise.mapper.QuestionMapper;
import com.prepwise.repository.CompanyRepository;
import com.prepwise.repository.QuestionCategoryRepository;
import com.prepwise.repository.QuestionRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final QuestionCategoryRepository categoryRepository;
    private final CompanyRepository companyRepository;
    private final QuestionMapper questionMapper;
    private final QuestionCategoryMapper categoryMapper;
    private final CompanyMapper companyMapper;

    @Transactional(readOnly = true)
    public Page<QuestionDto> getQuestions(
            Long categoryId,
            ModuleType moduleType,
            Difficulty difficulty,
            Long companyId,
            QuestionType questionType,
            Pageable pageable
    ) {
        Specification<Question> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (moduleType != null) {
                predicates.add(cb.equal(root.get("category").get("moduleType"), moduleType));
            }
            if (difficulty != null) {
                predicates.add(cb.equal(root.get("difficulty"), difficulty));
            }
            if (companyId != null) {
                predicates.add(cb.equal(root.get("company").get("id"), companyId));
            }
            if (questionType != null) {
                predicates.add(cb.equal(root.get("questionType"), questionType));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Question> page = questionRepository.findAll(spec, pageable);
        return page.map(questionMapper::toSanitizedDto);
    }

    @Transactional(readOnly = true)
    public QuestionDto getQuestionById(Long id, boolean includeAnswers) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));

        return includeAnswers ? questionMapper.toDto(question) : questionMapper.toSanitizedDto(question);
    }

    @Transactional(readOnly = true)
    public List<QuestionCategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CompanyDto> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(companyMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CompanyPreparationDto getCompanyPreparation(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        CompanyDto companyDto = companyMapper.toDto(company);

        long total = questionRepository.countByCompanyId(companyId);
        long aptitude = questionRepository.countByCompanyIdAndCategoryModuleType(companyId, ModuleType.APTITUDE);
        long coding = questionRepository.countByCompanyIdAndCategoryModuleType(companyId, ModuleType.CODING);
        long dsa = questionRepository.countByCompanyIdAndCategoryModuleType(companyId, ModuleType.DSA);
        long technical = questionRepository.countByCompanyIdAndCategoryModuleType(companyId, ModuleType.TECHNICAL);
        long hr = questionRepository.countByCompanyIdAndCategoryModuleType(companyId, ModuleType.HR);

        Map<String, Long> countsMap = new HashMap<>();
        countsMap.put("APTITUDE", aptitude);
        countsMap.put("CODING", coding);
        countsMap.put("DSA", dsa);
        countsMap.put("TECHNICAL", technical);
        countsMap.put("HR", hr);

        return CompanyPreparationDto.builder()
                .company(companyDto)
                .totalQuestions(total)
                .aptitudeQuestionsCount(aptitude)
                .codingQuestionsCount(coding)
                .dsaQuestionsCount(dsa)
                .technicalQuestionsCount(technical)
                .hrQuestionsCount(hr)
                .questionCountsByModule(countsMap)
                .build();
    }
}
