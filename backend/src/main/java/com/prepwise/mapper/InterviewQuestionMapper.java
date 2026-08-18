package com.prepwise.mapper;

import com.prepwise.dto.InterviewQuestionDto;
import com.prepwise.entity.InterviewQuestion;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InterviewQuestionMapper {

    private final InterviewAnswerMapper interviewAnswerMapper;

    public InterviewQuestionDto toDto(InterviewQuestion entity) {
        if (entity == null) return null;
        return InterviewQuestionDto.builder()
                .id(entity.getId())
                .interviewId(entity.getInterview() != null ? entity.getInterview().getId() : null)
                .questionOrder(entity.getQuestionOrder())
                .questionText(entity.getQuestionText())
                .questionType(entity.getQuestionType())
                .expectedConcepts(entity.getExpectedConcepts())
                .starterCode(entity.getStarterCode())
                .testCasesJson(entity.getTestCasesJson())
                .solutionCode(entity.getSolutionCode())
                .answer(entity.getAnswer() != null ? interviewAnswerMapper.toDto(entity.getAnswer()) : null)
                .build();
    }
}
