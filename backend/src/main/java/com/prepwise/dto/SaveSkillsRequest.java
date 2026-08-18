package com.prepwise.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaveSkillsRequest {

    @NotEmpty(message = "At least one skill must be selected")
    @Valid
    private List<UserSkillSelectionDto> skills;
}
