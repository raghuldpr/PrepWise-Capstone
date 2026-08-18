package com.prepwise.mapper;

import com.prepwise.dto.QuestionCategoryDto;
import com.prepwise.entity.QuestionCategory;
import org.springframework.stereotype.Component;

@Component
public class QuestionCategoryMapper {

    public QuestionCategoryDto toDto(QuestionCategory category) {
        if (category == null) return null;
        return QuestionCategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .moduleType(category.getModuleType())
                .description(category.getDescription())
                .build();
    }

    public QuestionCategory toEntity(QuestionCategoryDto dto) {
        if (dto == null) return null;
        return QuestionCategory.builder()
                .id(dto.getId())
                .name(dto.getName())
                .moduleType(dto.getModuleType())
                .description(dto.getDescription())
                .build();
    }
}
