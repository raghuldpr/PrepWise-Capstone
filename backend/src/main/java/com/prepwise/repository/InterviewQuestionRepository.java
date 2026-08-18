package com.prepwise.repository;

import com.prepwise.entity.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {
    List<InterviewQuestion> findByInterviewIdOrderByQuestionOrderAsc(Long interviewId);
    Optional<InterviewQuestion> findByIdAndInterviewId(Long id, Long interviewId);
}
