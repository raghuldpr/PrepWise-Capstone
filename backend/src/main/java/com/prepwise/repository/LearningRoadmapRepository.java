package com.prepwise.repository;

import com.prepwise.entity.LearningRoadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LearningRoadmapRepository extends JpaRepository<LearningRoadmap, Long> {
    List<LearningRoadmap> findByUserIdOrderByUpdatedAtDesc(Long userId);
    Optional<LearningRoadmap> findByIdAndUserId(Long id, Long userId);
    Optional<LearningRoadmap> findFirstByUserIdAndTargetRoleOrderByUpdatedAtDesc(Long userId, String targetRole);
}
