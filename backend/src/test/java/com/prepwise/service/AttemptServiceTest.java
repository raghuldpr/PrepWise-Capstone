package com.prepwise.service;

import com.prepwise.dto.AttemptRequestDto;
import com.prepwise.dto.AttemptResultDto;
import com.prepwise.dto.ProgressDto;
import com.prepwise.entity.*;
import com.prepwise.exception.ResourceNotFoundException;
import com.prepwise.mapper.AttemptMapper;
import com.prepwise.mapper.ProgressMapper;
import com.prepwise.repository.AttemptRepository;
import com.prepwise.repository.ProgressRepository;
import com.prepwise.repository.QuestionRepository;
import com.prepwise.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttemptServiceTest {

    @Mock
    private AttemptRepository attemptRepository;

    @Mock
    private ProgressRepository progressRepository;

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AttemptMapper attemptMapper;

    @Mock
    private ProgressMapper progressMapper;

    @InjectMocks
    private AttemptService attemptService;

    private User testUser;
    private QuestionCategory category;
    private Question mcqQuestion;
    private Question subjectiveQuestion;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(100L)
                .name("Test Candidate")
                .email("candidate@prepwise.com")
                .build();

        category = QuestionCategory.builder()
                .id(5L)
                .name("Aptitude - Quantitative")
                .moduleType(ModuleType.APTITUDE)
                .build();

        QuestionOption optionA = QuestionOption.builder()
                .id(101L)
                .optionText("24")
                .isCorrect(false)
                .build();

        QuestionOption optionB = QuestionOption.builder()
                .id(102L)
                .optionText("42")
                .isCorrect(true)
                .build();

        mcqQuestion = Question.builder()
                .id(1L)
                .questionText("What is 6 * 7?")
                .questionType(QuestionType.MCQ)
                .category(category)
                .expectedAnswer("42")
                .explanation("6 multiplied by 7 equals 42.")
                .options(List.of(optionA, optionB))
                .build();

        subjectiveQuestion = Question.builder()
                .id(2L)
                .questionText("Explain Binary Search Tree property.")
                .questionType(QuestionType.TECHNICAL)
                .category(category)
                .expectedAnswer("Left subtree values are smaller, right subtree values are larger")
                .explanation("BST maintains sorted order in nodes.")
                .build();
    }

    // ==========================================
    // MCQ Scoring Tests
    // ==========================================

    @Test
    @DisplayName("submitAttempt: MCQ correct answer yields score 100 and updates category progress metrics")
    void submitAttempt_mcqCorrectOption_calculatesScore100AndUpdatesProgress() {
        // Arrange
        AttemptRequestDto request = AttemptRequestDto.builder()
                .questionId(1L)
                .selectedAnswer("102") // Option B ID which is correct
                .timeTakenSeconds(45)
                .build();

        when(userRepository.findById(100L)).thenReturn(Optional.of(testUser));
        when(questionRepository.findById(1L)).thenReturn(Optional.of(mcqQuestion));

        Attempt savedAttempt = Attempt.builder()
                .id(501L)
                .user(testUser)
                .question(mcqQuestion)
                .selectedAnswer("102")
                .isCorrect(true)
                .score(BigDecimal.valueOf(100.00))
                .timeTakenSeconds(45)
                .build();

        when(attemptRepository.save(any(Attempt.class))).thenReturn(savedAttempt);
        when(progressRepository.findByUserIdAndCategoryId(100L, 5L)).thenReturn(Optional.empty());

        // Simulate 1 attempt in repository for category
        when(attemptRepository.findByUserIdAndQuestionCategoryId(100L, 5L))
                .thenReturn(List.of(savedAttempt));

        Progress updatedProgress = Progress.builder()
                .id(10L)
                .user(testUser)
                .category(category)
                .questionsAttempted(1)
                .questionsCorrect(1)
                .accuracy(BigDecimal.valueOf(100.00).setScale(2, RoundingMode.HALF_UP))
                .averageScore(BigDecimal.valueOf(100.00).setScale(2, RoundingMode.HALF_UP))
                .build();

        when(progressRepository.save(any(Progress.class))).thenReturn(updatedProgress);

        // Act
        AttemptResultDto result = attemptService.submitAttempt(100L, request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getAttemptId()).isEqualTo(501L);
        assertThat(result.getIsCorrect()).isTrue();
        assertThat(result.getScore()).isEqualByComparingTo(BigDecimal.valueOf(100.00));
        assertThat(result.getCorrectAnswer()).isEqualTo("42");
        assertThat(result.getCurrentAccuracy()).isEqualByComparingTo(BigDecimal.valueOf(100.00));

        // Verify Attempt object passed to save
        ArgumentCaptor<Attempt> attemptCaptor = ArgumentCaptor.forClass(Attempt.class);
        verify(attemptRepository).save(attemptCaptor.capture());
        Attempt capturedAttempt = attemptCaptor.getValue();
        assertThat(capturedAttempt.getIsCorrect()).isTrue();
        assertThat(capturedAttempt.getScore()).isEqualByComparingTo(BigDecimal.valueOf(100.00));

        // Verify Progress object passed to save
        ArgumentCaptor<Progress> progressCaptor = ArgumentCaptor.forClass(Progress.class);
        verify(progressRepository).save(progressCaptor.capture());
        Progress capturedProgress = progressCaptor.getValue();
        assertThat(capturedProgress.getQuestionsAttempted()).isEqualTo(1);
        assertThat(capturedProgress.getQuestionsCorrect()).isEqualTo(1);
        assertThat(capturedProgress.getAccuracy()).isEqualByComparingTo(BigDecimal.valueOf(100.00));
        assertThat(capturedProgress.getAverageScore()).isEqualByComparingTo(BigDecimal.valueOf(100.00));
    }

    @Test
    @DisplayName("submitAttempt: MCQ incorrect option yields score 0 and recalculates accuracy accordingly")
    void submitAttempt_mcqIncorrectOption_calculatesScoreZeroAndRecalculatesProgress() {
        // Arrange
        AttemptRequestDto request = AttemptRequestDto.builder()
                .questionId(1L)
                .selectedAnswer("101") // Option A ID which is incorrect ("24")
                .timeTakenSeconds(30)
                .build();

        when(userRepository.findById(100L)).thenReturn(Optional.of(testUser));
        when(questionRepository.findById(1L)).thenReturn(Optional.of(mcqQuestion));

        Attempt attempt1Correct = Attempt.builder()
                .id(500L)
                .user(testUser)
                .question(mcqQuestion)
                .isCorrect(true)
                .score(BigDecimal.valueOf(100.00))
                .build();

        Attempt attempt2Incorrect = Attempt.builder()
                .id(502L)
                .user(testUser)
                .question(mcqQuestion)
                .selectedAnswer("101")
                .isCorrect(false)
                .score(BigDecimal.ZERO)
                .timeTakenSeconds(30)
                .build();

        when(attemptRepository.save(any(Attempt.class))).thenReturn(attempt2Incorrect);
        when(progressRepository.findByUserIdAndCategoryId(100L, 5L)).thenReturn(Optional.empty());

        // 2 total attempts: 1 correct, 1 incorrect
        when(attemptRepository.findByUserIdAndQuestionCategoryId(100L, 5L))
                .thenReturn(List.of(attempt1Correct, attempt2Incorrect));

        Progress updatedProgress = Progress.builder()
                .id(10L)
                .user(testUser)
                .category(category)
                .questionsAttempted(2)
                .questionsCorrect(1)
                .accuracy(BigDecimal.valueOf(50.00))
                .averageScore(BigDecimal.valueOf(50.00))
                .build();

        when(progressRepository.save(any(Progress.class))).thenReturn(updatedProgress);

        // Act
        AttemptResultDto result = attemptService.submitAttempt(100L, request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getIsCorrect()).isFalse();
        assertThat(result.getScore()).isEqualByComparingTo(BigDecimal.ZERO);

        ArgumentCaptor<Progress> progressCaptor = ArgumentCaptor.forClass(Progress.class);
        verify(progressRepository).save(progressCaptor.capture());
        Progress capturedProgress = progressCaptor.getValue();
        assertThat(capturedProgress.getQuestionsAttempted()).isEqualTo(2);
        assertThat(capturedProgress.getQuestionsCorrect()).isEqualTo(1);
        assertThat(capturedProgress.getAccuracy()).isEqualByComparingTo(BigDecimal.valueOf(50.00));
        assertThat(capturedProgress.getAverageScore()).isEqualByComparingTo(BigDecimal.valueOf(50.00));
    }

    // ==========================================
    // Non-MCQ / Subjective Scoring Tests
    // ==========================================

    @Test
    @DisplayName("submitAttempt: subjective question matching expected answer case-insensitively gets 100 score")
    void submitAttempt_subjectiveMatchingExpectedAnswer_scores100() {
        // Arrange
        AttemptRequestDto request = AttemptRequestDto.builder()
                .questionId(2L)
                .selectedAnswer("Left subtree values are smaller, right subtree values are larger")
                .timeTakenSeconds(60)
                .build();

        when(userRepository.findById(100L)).thenReturn(Optional.of(testUser));
        when(questionRepository.findById(2L)).thenReturn(Optional.of(subjectiveQuestion));

        Attempt savedAttempt = Attempt.builder()
                .id(503L)
                .user(testUser)
                .question(subjectiveQuestion)
                .isCorrect(true)
                .score(BigDecimal.valueOf(100.00))
                .build();

        when(attemptRepository.save(any(Attempt.class))).thenReturn(savedAttempt);

        Progress progress = Progress.builder()
                .questionsAttempted(1)
                .questionsCorrect(1)
                .accuracy(BigDecimal.valueOf(100.00))
                .build();
        when(progressRepository.save(any(Progress.class))).thenReturn(progress);

        // Act
        AttemptResultDto result = attemptService.submitAttempt(100L, request);

        // Assert
        assertThat(result.getIsCorrect()).isTrue();
        assertThat(result.getScore()).isEqualByComparingTo(BigDecimal.valueOf(100.00));
    }

    // ==========================================
    // Exception & Edge Cases
    // ==========================================

    @Test
    @DisplayName("submitAttempt: throws ResourceNotFoundException when user is not found")
    void submitAttempt_userNotFound_throwsResourceNotFoundException() {
        AttemptRequestDto request = AttemptRequestDto.builder().questionId(1L).build();
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> attemptService.submitAttempt(999L, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found with id: 999");
    }

    @Test
    @DisplayName("submitAttempt: throws ResourceNotFoundException when question is not found")
    void submitAttempt_questionNotFound_throwsResourceNotFoundException() {
        AttemptRequestDto request = AttemptRequestDto.builder().questionId(999L).build();
        when(userRepository.findById(100L)).thenReturn(Optional.of(testUser));
        when(questionRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> attemptService.submitAttempt(100L, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Question not found with id: 999");
    }

    // ==========================================
    // Weak Areas Filtering
    // ==========================================

    @Test
    @DisplayName("getWeakAreas: returns categories with accuracy strictly below threshold")
    void getWeakAreas_filtersCategoriesBelowAccuracyThreshold() {
        Progress p1 = Progress.builder().accuracy(BigDecimal.valueOf(85.00)).build();
        Progress p2 = Progress.builder().accuracy(BigDecimal.valueOf(45.50)).build(); // Weak
        Progress p3 = Progress.builder().accuracy(BigDecimal.valueOf(59.99)).build(); // Weak

        when(progressRepository.findByUserId(100L)).thenReturn(List.of(p1, p2, p3));
        when(progressMapper.toDto(p2)).thenReturn(ProgressDto.builder().accuracy(BigDecimal.valueOf(45.50)).build());
        when(progressMapper.toDto(p3)).thenReturn(ProgressDto.builder().accuracy(BigDecimal.valueOf(59.99)).build());

        List<ProgressDto> weakAreas = attemptService.getWeakAreas(100L, BigDecimal.valueOf(60.00));

        assertThat(weakAreas).hasSize(2);
        assertThat(weakAreas.get(0).getAccuracy()).isEqualByComparingTo(BigDecimal.valueOf(45.50));
        assertThat(weakAreas.get(1).getAccuracy()).isEqualByComparingTo(BigDecimal.valueOf(59.99));
    }
}
