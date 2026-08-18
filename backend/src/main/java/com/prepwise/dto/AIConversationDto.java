package com.prepwise.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIConversationDto {
    private Long id;
    private Long userId;
    private String title;
    private String context;
    private List<AIMessageDto> messages;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
