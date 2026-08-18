package com.prepwise.repository;

import com.prepwise.entity.AIRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIRequestRepository extends JpaRepository<AIRequest, Long> {
    List<AIRequest> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<AIRequest> findByUserIdAndFeature(Long userId, String feature);
}
