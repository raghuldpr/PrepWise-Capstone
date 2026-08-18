package com.prepwise.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIMessageDto {
    private Long id;
    private Long conversationId;
    private String role;
    private String messageText;
    private LocalDateTime createdAt;
}
