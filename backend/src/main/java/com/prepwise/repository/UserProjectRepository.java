package com.prepwise.repository;

import com.prepwise.entity.UserProject;
import com.prepwise.entity.UserProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProjectRepository extends JpaRepository<UserProject, Long> {
    List<UserProject> findByUserId(Long userId);
    List<UserProject> findByUserIdAndStatus(Long userId, UserProjectStatus status);
    Optional<UserProject> findByUserIdAndProjectId(Long userId, Long projectId);
    Optional<UserProject> findByIdAndUserId(Long id, Long userId);
    boolean existsByUserIdAndProjectId(Long userId, Long projectId);
}
