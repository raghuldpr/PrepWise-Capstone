package com.prepwise.mapper;

import com.prepwise.dto.AttemptDto;
import com.prepwise.entity.Attempt;
import org.springframework.stereotype.Component;

@Component
public class AttemptMapper {

    public AttemptDto toDto(Attempt attempt) {
        if (attempt == null) return null;
        return AttemptDto.builder()
                .id(attempt.getId())
                .userId(attempt.getUser() != null ? attempt.getUser().getId() : null)
                .questionId(attempt.getQuestion() != null ? attempt.getQuestion().getId() : null)
                .questionTitle(attempt.getQuestion() != null ? attempt.getQuestion().getTitle() : null)
                .selectedAnswer(attempt.getSelectedAnswer())
                .isCorrect(attempt.getIsCorrect())
                .score(attempt.getScore())
                .timeTakenSeconds(attempt.getTimeTakenSeconds())
                .attemptedAt(attempt.getAttemptedAt())
                .build();
    }
}
