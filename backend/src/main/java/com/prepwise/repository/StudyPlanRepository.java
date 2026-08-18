package com.prepwise.repository;

import com.prepwise.entity.StudyPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudyPlanRepository extends JpaRepository<StudyPlan, Long> {
    List<StudyPlan> findByUserIdOrderByUpdatedAtDesc(Long userId);
    Optional<StudyPlan> findByIdAndUserId(Long id, Long userId);
}
