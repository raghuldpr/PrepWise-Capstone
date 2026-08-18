package com.prepwise.service;

import com.prepwise.dto.*;
import com.prepwise.entity.*;
import com.prepwise.exception.ResourceNotFoundException;
import com.prepwise.mapper.AttemptMapper;
import com.prepwise.mapper.ProgressMapper;
import com.prepwise.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttemptService {

    private final AttemptRepository attemptRepository;
    private final ProgressRepository progressRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final AttemptMapper attemptMapper;
    private final ProgressMapper progressMapper;

    @Transactional
    public AttemptResultDto submitAttempt(Long userId, AttemptRequestDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + request.getQuestionId()));

        boolean computedIsCorrect = false;
        BigDecimal computedScore = BigDecimal.ZERO;
        String correctAnswerText = question.getExpectedAnswer();

        if (question.getQuestionType() == QuestionType.MCQ && question.getOptions() != null && !question.getOptions().isEmpty()) {
            Optional<QuestionOption> correctOpt = question.getOptions().stream()
                    .filter(opt -> Boolean.TRUE.equals(opt.getIsCorrect()))
                    .findFirst();

            if (correctOpt.isPresent()) {
                correctAnswerText = correctOpt.get().getOptionText();
            }

            String selected = request.getSelectedAnswer() != null ? request.getSelectedAnswer().trim() : "";
            for (QuestionOption opt : question.getOptions()) {
                boolean matchesId = String.valueOf(opt.getId()).equals(selected);
                boolean matchesText = opt.getOptionText() != null && opt.getOptionText().trim().equalsIgnoreCase(selected);

                if ((matchesId || matchesText) && Boolean.TRUE.equals(opt.getIsCorrect())) {
                    computedIsCorrect = true;
                    computedScore = BigDecimal.valueOf(100.00);
                    break;
                }
            }
        } else {
            if (Boolean.TRUE.equals(request.getIsCorrect())) {
                computedIsCorrect = true;
                computedScore = request.getScore() != null ? request.getScore() : BigDecimal.valueOf(100.00);
            } else if (question.getExpectedAnswer() != null && request.getSelectedAnswer() != null
                    && request.getSelectedAnswer().trim().equalsIgnoreCase(question.getExpectedAnswer().trim())) {
                computedIsCorrect = true;
                computedScore = BigDecimal.valueOf(100.00);
            } else {
                computedIsCorrect = Boolean.TRUE.equals(request.getIsCorrect());
                computedScore = request.getScore() != null ? request.getScore() : BigDecimal.ZERO;
            }
        }

        Attempt attempt = Attempt.builder()
                .user(user)
                .question(question)
                .selectedAnswer(request.getSelectedAnswer())
                .isCorrect(computedIsCorrect)
                .score(computedScore)
                .timeTakenSeconds(request.getTimeTakenSeconds() != null ? request.getTimeTakenSeconds() : 0)
                .build();

        attempt = attemptRepository.save(attempt);

        // Recalculate and upsert Progress for User + Question Category
        Progress progress = updateProgress(user, question.getCategory());

        return AttemptResultDto.builder()
                .attemptId(attempt.getId())
                .questionId(question.getId())
                .isCorrect(attempt.getIsCorrect())
                .score(attempt.getScore())
                .selectedAnswer(attempt.getSelectedAnswer())
                .correctAnswer(correctAnswerText)
                .explanation(question.getExplanation())
                .currentAccuracy(progress.getAccuracy())
                .attemptedAt(attempt.getAttemptedAt())
                .build();
    }

    private Progress updateProgress(User user, QuestionCategory category) {
        if (category == null) return null;

        Progress progress = progressRepository.findByUserIdAndCategoryId(user.getId(), category.getId())
                .orElseGet(() -> Progress.builder()
                        .user(user)
                        .category(category)
                        .questionsAttempted(0)
                        .questionsCorrect(0)
                        .accuracy(BigDecimal.ZERO)
                        .averageScore(BigDecimal.ZERO)
                        .build());

        List<Attempt> categoryAttempts = attemptRepository.findByUserIdAndQuestionCategoryId(user.getId(), category.getId());

        int totalAttempted = categoryAttempts.size();
        int totalCorrect = (int) categoryAttempts.stream().filter(a -> Boolean.TRUE.equals(a.getIsCorrect())).count();

        BigDecimal accuracy = BigDecimal.ZERO;
        BigDecimal avgScore = BigDecimal.ZERO;

        if (totalAttempted > 0) {
            accuracy = BigDecimal.valueOf((double) totalCorrect / totalAttempted * 100.0)
                    .setScale(2, RoundingMode.HALF_UP);

            double sumScore = categoryAttempts.stream()
                    .map(Attempt::getScore)
                    .filter(Objects::nonNull)
                    .mapToDouble(BigDecimal::doubleValue)
                    .sum();
            avgScore = BigDecimal.valueOf(sumScore / totalAttempted)
                    .setScale(2, RoundingMode.HALF_UP);
        }

        progress.setQuestionsAttempted(totalAttempted);
        progress.setQuestionsCorrect(totalCorrect);
        progress.setAccuracy(accuracy);
        progress.setAverageScore(avgScore);

        return progressRepository.save(progress);
    }

    @Transactional(readOnly = true)
    public List<AttemptDto> getUserRecentAttempts(Long userId) {
        return attemptRepository.findByUserIdOrderByAttemptedAtDesc(userId).stream()
                .map(attemptMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProgressDto> getUserProgress(Long userId) {
        return progressRepository.findByUserId(userId).stream()
                .map(progressMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProgressDto getUserProgressByCategoryId(Long userId, Long categoryId) {
        Progress progress = progressRepository.findByUserIdAndCategoryId(userId, categoryId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Progress record not found for category id: " + categoryId));
        return progressMapper.toDto(progress);
    }

    @Transactional(readOnly = true)
    public List<ProgressDto> getWeakAreas(Long userId, BigDecimal threshold) {
        BigDecimal cutOff = threshold != null ? threshold : BigDecimal.valueOf(60.00);
        return progressRepository.findByUserId(userId).stream()
                .filter(p -> p.getAccuracy() != null && p.getAccuracy().compareTo(cutOff) < 0)
                .map(progressMapper::toDto)
                .collect(Collectors.toList());
    }
}
