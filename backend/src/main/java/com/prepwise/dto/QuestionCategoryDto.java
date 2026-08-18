package com.prepwise.dto;

import com.prepwise.entity.ModuleType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionCategoryDto {
    private Long id;
    private String name;
    private ModuleType moduleType;
    private String description;
}
