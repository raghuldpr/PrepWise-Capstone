package com.prepwise.mapper;

import com.prepwise.dto.ProgressDto;
import com.prepwise.entity.Progress;
import org.springframework.stereotype.Component;

@Component
public class ProgressMapper {

    public ProgressDto toDto(Progress progress) {
        if (progress == null) return null;
        return ProgressDto.builder()
                .id(progress.getId())
                .userId(progress.getUser() != null ? progress.getUser().getId() : null)
                .categoryId(progress.getCategory() != null ? progress.getCategory().getId() : null)
                .categoryName(progress.getCategory() != null ? progress.getCategory().getName() : null)
                .moduleType(progress.getCategory() != null ? progress.getCategory().getModuleType() : null)
                .questionsAttempted(progress.getQuestionsAttempted())
                .questionsCorrect(progress.getQuestionsCorrect())
                .accuracy(progress.getAccuracy())
                .averageScore(progress.getAverageScore())
                .updatedAt(progress.getUpdatedAt())
                .build();
    }
}
