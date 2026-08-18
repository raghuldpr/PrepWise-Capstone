package com.prepwise.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodingSubmitRequest {

    @NotNull(message = "Question ID is required")
    private Long questionId;

    @NotBlank(message = "Code is required")
    private String code;

    private String language;
}
