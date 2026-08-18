package com.prepwise.repository;

import com.prepwise.entity.AIMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIMessageRepository extends JpaRepository<AIMessage, Long> {
    List<AIMessage> findByConversationIdOrderByCreatedAtAsc(Long conversationId);
    List<AIMessage> findByConversationIdAndConversationUserIdOrderByCreatedAtAsc(Long conversationId, Long userId);
}
