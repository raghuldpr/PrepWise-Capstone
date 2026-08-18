package com.prepwise.repository;

import com.prepwise.entity.Interview;
import com.prepwise.entity.InterviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByUserIdOrderByCreatedAtDesc(Long userId);
    Page<Interview> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    List<Interview> findByUserIdAndStatus(Long userId, InterviewStatus status);
    Optional<Interview> findByIdAndUserId(Long id, Long userId);
}
