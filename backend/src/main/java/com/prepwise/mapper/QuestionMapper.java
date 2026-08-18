package com.prepwise.mapper;

import com.prepwise.dto.QuestionDto;
import com.prepwise.dto.QuestionOptionDto;
import com.prepwise.entity.Question;
import com.prepwise.entity.QuestionOption;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.stream.Collectors;

@Component
public class QuestionMapper {

    public QuestionOptionDto toOptionDto(QuestionOption option) {
        if (option == null) return null;
        return QuestionOptionDto.builder()
                .id(option.getId())
                .questionId(option.getQuestion() != null ? option.getQuestion().getId() : null)
                .optionText(option.getOptionText())
                .isCorrect(option.getIsCorrect())
                .build();
    }

    public QuestionOptionDto toSanitizedOptionDto(QuestionOption option) {
        if (option == null) return null;
        return QuestionOptionDto.builder()
                .id(option.getId())
                .questionId(option.getQuestion() != null ? option.getQuestion().getId() : null)
                .optionText(option.getOptionText())
                .isCorrect(null) // Strip correct indicator to prevent answer leakage
                .build();
    }

    public QuestionDto toDto(Question question) {
        if (question == null) return null;
        return QuestionDto.builder()
                .id(question.getId())
                .categoryId(question.getCategory() != null ? question.getCategory().getId() : null)
                .categoryName(question.getCategory() != null ? question.getCategory().getName() : null)
                .companyId(question.getCompany() != null ? question.getCompany().getId() : null)
                .companyName(question.getCompany() != null ? question.getCompany().getName() : null)
                .title(question.getTitle())
                .questionText(question.getQuestionText())
                .difficulty(question.getDifficulty())
                .questionType(question.getQuestionType())
                .topic(question.getTopic())
                .expectedAnswer(question.getExpectedAnswer())
                .explanation(question.getExplanation())
                .options(question.getOptions() != null
                        ? question.getOptions().stream().map(this::toOptionDto).collect(Collectors.toList())
                        : Collections.emptyList())
                .build();
    }

    public QuestionDto toSanitizedDto(Question question) {
        if (question == null) return null;
        return QuestionDto.builder()
                .id(question.getId())
                .categoryId(question.getCategory() != null ? question.getCategory().getId() : null)
                .categoryName(question.getCategory() != null ? question.getCategory().getName() : null)
                .companyId(question.getCompany() != null ? question.getCompany().getId() : null)
                .companyName(question.getCompany() != null ? question.getCompany().getName() : null)
                .title(question.getTitle())
                .questionText(question.getQuestionText())
                .difficulty(question.getDifficulty())
                .questionType(question.getQuestionType())
                .topic(question.getTopic())
                .expectedAnswer(null) // Strip answer
                .explanation(null) // Strip explanation until attempt
                .options(question.getOptions() != null
                        ? question.getOptions().stream().map(this::toSanitizedOptionDto).collect(Collectors.toList())
                        : Collections.emptyList())
                .build();
    }
}
