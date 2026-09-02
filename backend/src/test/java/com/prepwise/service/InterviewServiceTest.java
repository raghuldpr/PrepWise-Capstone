package com.prepwise.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prepwise.dto.*;
import com.prepwise.entity.*;
import com.prepwise.exception.ResourceNotFoundException;
import com.prepwise.mapper.InterviewAnswerMapper;
import com.prepwise.mapper.InterviewMapper;
import com.prepwise.mapper.InterviewQuestionMapper;
import com.prepwise.repository.*;
import com.prepwise.service.ai.AIProviderClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InterviewServiceTest {

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private InterviewQuestionRepository interviewQuestionRepository;

    @Mock
    private InterviewAnswerRepository interviewAnswerRepository;

    @Mock
    private InterviewReportRepository interviewReportRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private ResumeAnalysisRepository resumeAnalysisRepository;

    @Mock
    private ProfileRepository profileRepository;

    @Mock
    private InterviewMapper interviewMapper;

    @Mock
    private InterviewQuestionMapper interviewQuestionMapper;

    @Mock
    private InterviewAnswerMapper interviewAnswerMapper;

    @Mock
    private AIProviderClient aiProviderClient;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private InterviewService interviewService;

    private User testUser;
    private Interview testInterview;
    private InterviewQuestion firstQuestion;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .name("Alex Engineer")
                .email("alex@example.com")
                .build();

        testInterview = Interview.builder()
                .id(10L)
                .user(testUser)
                .title("Backend Engineer Mock Interview")
                .targetRole("Backend Engineer")
                .interviewType(InterviewType.TECHNICAL)
                .difficulty(Difficulty.MEDIUM)
                .questionCount(3)
                .status(InterviewStatus.IN_PROGRESS)
                .build();

        firstQuestion = InterviewQuestion.builder()
                .id(101L)
                .interview(testInterview)
                .questionOrder(1)
                .questionText("Explain RESTful API principles and idempotency.")
                .questionType("TECHNICAL")
                .expectedConcepts("HTTP methods, Statelessness, Idempotency")
                .build();
    }

    // ==========================================
    // Start Interview & AI Question Generation
    // ==========================================

    @Test
    @DisplayName("startInterview: calls AIProviderClient to adaptively generate 1st question and sets interview status to IN_PROGRESS")
    void startInterview_usesAIProviderClientToGenerateFirstQuestion() {
        // Arrange
        testInterview.setStatus(InterviewStatus.CREATED);

        when(interviewRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(testInterview));
        when(interviewQuestionRepository.findByInterviewIdOrderByQuestionOrderAsc(10L)).thenReturn(List.of());
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(resumeRepository.findFirstByUserIdOrderByUploadedAtDesc(1L)).thenReturn(Optional.empty());

        String aiQuestionResponse = """
                {
                  "questionText": "What are the core differences between optimistic and pessimistic locking?",
                  "questionType": "TECHNICAL",
                  "expectedConcepts": "Database transactions, concurrency control, lock contention"
                }
                """;

        when(aiProviderClient.complete(anyString(), anyString(), eq("INTERVIEW_QUESTION"), eq(testUser)))
                .thenReturn(aiQuestionResponse);

        when(interviewQuestionRepository.save(any(InterviewQuestion.class))).thenReturn(firstQuestion);
        when(interviewQuestionMapper.toDto(any(InterviewQuestion.class))).thenReturn(InterviewQuestionDto.builder()
                .id(101L)
                .questionOrder(1)
                .questionText("What are the core differences between optimistic and pessimistic locking?")
                .questionType("TECHNICAL")
                .build());

        // Act
        InterviewQuestionDto result = interviewService.startInterview(10L, 1L);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(101L);

        // Verify AI client was invoked to generate question #1
        ArgumentCaptor<String> userPromptCaptor = ArgumentCaptor.forClass(String.class);
        verify(aiProviderClient).complete(anyString(), userPromptCaptor.capture(), eq("INTERVIEW_QUESTION"), eq(testUser));
        assertThat(userPromptCaptor.getValue()).contains("Generate question #1.");
        assertThat(userPromptCaptor.getValue()).contains("Target Role: Backend Engineer");

        // Verify question was saved
        verify(interviewQuestionRepository).save(any(InterviewQuestion.class));
    }

    // ==========================================
    // Answer Evaluation & Adaptive Next Question
    // ==========================================

    @Test
    @DisplayName("answerQuestion: calls AIProviderClient for evaluation and generates adaptively adjusted next question")
    void answerQuestion_evaluatesAnswerAndGeneratesNextAdaptiveQuestion() {
        // Arrange
        AnswerQuestionRequest answerRequest = AnswerQuestionRequest.builder()
                .questionId(101L)
                .answerText("GET and PUT are idempotent HTTP methods, while POST is non-idempotent because multiple calls create multiple resources.")
                .build();

        when(interviewRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(testInterview));
        when(interviewQuestionRepository.findByIdAndInterviewId(101L, 10L)).thenReturn(Optional.of(firstQuestion));
        when(interviewAnswerRepository.findByQuestionId(101L)).thenReturn(Optional.empty());

        // Mock AI Evaluation for question 1
        String aiEvalResponse = """
                {
                  "score": 90,
                  "feedback": "Excellent answer clearly defining HTTP method idempotency.",
                  "sampleAnswer": "Idempotency means multiple identical requests yield the same server state..."
                }
                """;

        when(aiProviderClient.complete(anyString(), anyString(), eq("INTERVIEW_EVALUATION"), eq(testUser)))
                .thenReturn(aiEvalResponse);

        InterviewAnswer savedAnswer = InterviewAnswer.builder()
                .id(201L)
                .question(firstQuestion)
                .userAnswer(answerRequest.getAnswerText())
                .score(90)
                .feedback("Excellent answer clearly defining HTTP method idempotency.")
                .sampleAnswer("Idempotency means multiple identical requests yield the same server state...")
                .build();

        when(interviewAnswerRepository.save(any(InterviewAnswer.class))).thenReturn(savedAnswer);

        // Mock previous questions list (currently 1 question answered)
        firstQuestion.setAnswer(savedAnswer);
        when(interviewQuestionRepository.findByInterviewIdOrderByQuestionOrderAsc(10L))
                .thenReturn(List.of(firstQuestion));

        // Mock AI Next Question Generation (#2) passing previous scores in context
        String aiNextQuestionResponse = """
                {
                  "questionText": "How would you design a distributed cache to handle high read throughput?",
                  "questionType": "TECHNICAL",
                  "expectedConcepts": "Consistency, partitioning, eviction policy"
                }
                """;

        when(aiProviderClient.complete(anyString(), anyString(), eq("INTERVIEW_QUESTION"), eq(testUser)))
                .thenReturn(aiNextQuestionResponse);

        InterviewQuestion secondQuestion = InterviewQuestion.builder()
                .id(102L)
                .interview(testInterview)
                .questionOrder(2)
                .questionText("How would you design a distributed cache to handle high read throughput?")
                .questionType("TECHNICAL")
                .build();

        when(interviewQuestionRepository.save(any(InterviewQuestion.class))).thenReturn(secondQuestion);
        when(interviewAnswerMapper.toDto(savedAnswer)).thenReturn(InterviewAnswerDto.builder().id(201L).score(90).build());
        when(interviewQuestionMapper.toDto(secondQuestion)).thenReturn(InterviewQuestionDto.builder().id(102L).questionOrder(2).build());

        // Act
        AnswerQuestionResponse response = interviewService.answerQuestion(10L, 1L, answerRequest);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.isReadyForCompletion()).isFalse();
        assertThat(response.getNextQuestion()).isNotNull();
        assertThat(response.getNextQuestion().getId()).isEqualTo(102L);

        // Verify evaluation AI call
        verify(aiProviderClient).complete(anyString(), anyString(), eq("INTERVIEW_EVALUATION"), eq(testUser));

        // Verify adaptive prompt included candidate's previous score (90/100)
        ArgumentCaptor<String> userPromptCaptor = ArgumentCaptor.forClass(String.class);
        verify(aiProviderClient).complete(anyString(), userPromptCaptor.capture(), eq("INTERVIEW_QUESTION"), eq(testUser));
        assertThat(userPromptCaptor.getValue()).contains("Generate question #2.");
        assertThat(userPromptCaptor.getValue()).contains("Candidate Score: 90/100");
    }

    @Test
    @DisplayName("answerQuestion: handles skipped question with score 0 and requests sample answer")
    void answerQuestion_whenSkipped_setsScoreToZeroAndGeneratesNextQuestion() {
        // Arrange
        AnswerQuestionRequest answerRequest = AnswerQuestionRequest.builder()
                .questionId(101L)
                .answerText("SKIP")
                .build();

        when(interviewRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(testInterview));
        when(interviewQuestionRepository.findByIdAndInterviewId(101L, 10L)).thenReturn(Optional.of(firstQuestion));
        when(interviewAnswerRepository.findByQuestionId(101L)).thenReturn(Optional.empty());

        when(aiProviderClient.complete(anyString(), anyString(), eq("INTERVIEW_SAMPLE_ANSWER"), eq(testUser)))
                .thenReturn("Model sample answer for REST principles.");

        InterviewAnswer savedSkippedAnswer = InterviewAnswer.builder()
                .id(202L)
                .question(firstQuestion)
                .userAnswer("Question skipped by candidate.")
                .score(0)
                .feedback("No answer provided. Candidate skipped this question.")
                .sampleAnswer("Model sample answer for REST principles.")
                .build();

        when(interviewAnswerRepository.save(any(InterviewAnswer.class))).thenReturn(savedSkippedAnswer);
        when(interviewQuestionRepository.findByInterviewIdOrderByQuestionOrderAsc(10L))
                .thenReturn(List.of(firstQuestion));

        String aiNextQuestionResponse = """
                {
                  "questionText": "What is dependency injection in Spring?",
                  "questionType": "TECHNICAL",
                  "expectedConcepts": "IoC container, autowiring, coupling"
                }
                """;

        when(aiProviderClient.complete(anyString(), anyString(), eq("INTERVIEW_QUESTION"), eq(testUser)))
                .thenReturn(aiNextQuestionResponse);

        InterviewQuestion secondQuestion = InterviewQuestion.builder().id(102L).questionOrder(2).build();
        when(interviewQuestionRepository.save(any(InterviewQuestion.class))).thenReturn(secondQuestion);

        // Act
        AnswerQuestionResponse response = interviewService.answerQuestion(10L, 1L, answerRequest);

        // Assert
        verify(interviewAnswerRepository).save(argThat(answer ->
                answer.getScore() == 0 &&
                answer.getUserAnswer().contains("skipped") &&
                answer.getFeedback().contains("Candidate skipped")
        ));
        assertThat(response.isReadyForCompletion()).isFalse();
    }

    @Test
    @DisplayName("answerQuestion: sets readyForCompletion=true when final target question count is reached")
    void answerQuestion_whenFinalQuestionReached_marksReadyForCompletion() {
        // Arrange: Interview target questionCount = 3, and we are submitting 3rd question
        testInterview.setQuestionCount(3);

        InterviewQuestion q3 = InterviewQuestion.builder()
                .id(103L)
                .interview(testInterview)
                .questionOrder(3)
                .questionText("Explain database indexing.")
                .build();

        AnswerQuestionRequest answerRequest = AnswerQuestionRequest.builder()
                .questionId(103L)
                .answerText("Index speeds up read operations using B-Trees...")
                .build();

        when(interviewRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(testInterview));
        when(interviewQuestionRepository.findByIdAndInterviewId(103L, 10L)).thenReturn(Optional.of(q3));
        when(interviewAnswerRepository.findByQuestionId(103L)).thenReturn(Optional.empty());

        when(aiProviderClient.complete(anyString(), anyString(), eq("INTERVIEW_EVALUATION"), eq(testUser)))
                .thenReturn("{\"score\": 88, \"feedback\": \"Solid answer\", \"sampleAnswer\": \"Sample\"}");

        InterviewAnswer savedAnswer = InterviewAnswer.builder().id(203L).score(88).build();
        when(interviewAnswerRepository.save(any(InterviewAnswer.class))).thenReturn(savedAnswer);

        // Currently 3 total questions in interview
        when(interviewQuestionRepository.findByInterviewIdOrderByQuestionOrderAsc(10L))
                .thenReturn(List.of(firstQuestion, InterviewQuestion.builder().id(102L).questionOrder(2).build(), q3));

        // Act
        AnswerQuestionResponse response = interviewService.answerQuestion(10L, 1L, answerRequest);

        // Assert
        assertThat(response.isReadyForCompletion()).isTrue();
        assertThat(response.getNextQuestion()).isNull();

        // Ensure no additional question was generated
        verify(aiProviderClient, never()).complete(anyString(), anyString(), eq("INTERVIEW_QUESTION"), any());
    }

    @Test
    @DisplayName("answerQuestion: throws ResourceNotFoundException when interview does not exist")
    void answerQuestion_interviewNotFound_throwsResourceNotFoundException() {
        AnswerQuestionRequest answerRequest = AnswerQuestionRequest.builder().questionId(101L).build();
        when(interviewRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> interviewService.answerQuestion(99L, 1L, answerRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Interview not found with id: 99");
    }
}
