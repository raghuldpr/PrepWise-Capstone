package com.prepwise.dto;

import com.prepwise.entity.ProficiencyLevel;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillDto {

    private Long id;
    private String name;
    private String category;
    private String description;
    private ProficiencyLevel proficiencyLevel;
}
