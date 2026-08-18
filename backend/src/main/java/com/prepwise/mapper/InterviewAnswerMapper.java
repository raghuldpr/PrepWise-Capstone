package com.prepwise.mapper;

import com.prepwise.dto.InterviewAnswerDto;
import com.prepwise.entity.InterviewAnswer;
import org.springframework.stereotype.Component;

@Component
public class InterviewAnswerMapper {

    public InterviewAnswerDto toDto(InterviewAnswer entity) {
        if (entity == null) return null;
        return InterviewAnswerDto.builder()
                .id(entity.getId())
                .questionId(entity.getQuestion() != null ? entity.getQuestion().getId() : null)
                .userAnswer(entity.getUserAnswer())
                .audioUrl(entity.getAudioUrl())
                .score(entity.getScore())
                .feedback(entity.getFeedback())
                .sampleAnswer(entity.getSampleAnswer())
                .answeredAt(entity.getAnsweredAt())
                .build();
    }
}
