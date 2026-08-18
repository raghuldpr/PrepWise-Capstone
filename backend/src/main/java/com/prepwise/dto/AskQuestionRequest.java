package com.prepwise.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AskQuestionRequest {
    private Long conversationId;

    @NotBlank(message = "Question is required")
    private String question;

    private String context;
}
