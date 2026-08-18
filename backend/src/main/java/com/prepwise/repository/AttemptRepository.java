package com.prepwise.repository;

import com.prepwise.entity.Attempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttemptRepository extends JpaRepository<Attempt, Long> {
    List<Attempt> findByUserIdOrderByAttemptedAtDesc(Long userId);
    List<Attempt> findByUserIdAndQuestionId(Long userId, Long questionId);
    Optional<Attempt> findFirstByUserIdAndQuestionIdOrderByAttemptedAtDesc(Long userId, Long questionId);
    long countByUserId(Long userId);

    List<Attempt> findByUserIdAndQuestionCategoryId(Long userId, Long categoryId);
    long countByUserIdAndQuestionCategoryId(Long userId, Long categoryId);
    long countByUserIdAndQuestionCategoryIdAndIsCorrectTrue(Long userId, Long categoryId);
}
