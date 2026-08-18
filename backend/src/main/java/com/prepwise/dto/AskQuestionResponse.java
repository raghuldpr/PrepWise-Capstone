package com.prepwise.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AskQuestionResponse {
    private Long conversationId;
    private String reply;
    private String title;
    private AIConversationDto conversation;
}
