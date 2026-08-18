package com.prepwise.repository;

import com.prepwise.entity.Difficulty;
import com.prepwise.entity.ModuleType;
import com.prepwise.entity.Question;
import com.prepwise.entity.QuestionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long>, JpaSpecificationExecutor<Question> {
    List<Question> findByCategoryId(Long categoryId);
    List<Question> findByCompanyId(Long companyId);
    List<Question> findByDifficulty(Difficulty difficulty);
    List<Question> findByQuestionType(QuestionType questionType);
    List<Question> findByCategoryIdAndDifficulty(Long categoryId, Difficulty difficulty);

    long countByCompanyId(Long companyId);
    long countByCompanyIdAndCategoryModuleType(Long companyId, ModuleType moduleType);
}
