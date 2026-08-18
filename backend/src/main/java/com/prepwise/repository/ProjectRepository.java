package com.prepwise.repository;

import com.prepwise.entity.Difficulty;
import com.prepwise.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByDifficulty(Difficulty difficulty);
    List<Project> findByDomainContainingIgnoreCase(String domain);
}
