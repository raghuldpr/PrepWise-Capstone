package com.prepwise.dto;

import com.prepwise.entity.ProficiencyLevel;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSkillSelectionDto {

    @NotNull(message = "Skill ID is required")
    private Long skillId;

    @Builder.Default
    private ProficiencyLevel proficiencyLevel = ProficiencyLevel.BEGINNER;
}
