package com.prepwise.repository;

import com.prepwise.entity.ModuleType;
import com.prepwise.entity.QuestionCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionCategoryRepository extends JpaRepository<QuestionCategory, Long> {
    List<QuestionCategory> findByModuleType(ModuleType moduleType);
}
