package com.prepwise.repository;

import com.prepwise.entity.AIConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AIConversationRepository extends JpaRepository<AIConversation, Long> {
    List<AIConversation> findByUserIdOrderByUpdatedAtDesc(Long userId);
    Optional<AIConversation> findByIdAndUserId(Long id, Long userId);
}
