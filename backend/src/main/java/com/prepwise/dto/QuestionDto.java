package com.prepwise.dto;

import com.prepwise.entity.Difficulty;
import com.prepwise.entity.QuestionType;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionDto {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private Long companyId;
    private String companyName;
    private String title;
    private String questionText;
    private Difficulty difficulty;
    private QuestionType questionType;
    private String topic;
    private String expectedAnswer;
    private String explanation;
    private List<QuestionOptionDto> options;
}
