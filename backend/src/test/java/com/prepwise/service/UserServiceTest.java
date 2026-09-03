package com.prepwise.service;

import com.prepwise.dto.*;
import com.prepwise.entity.*;
import com.prepwise.exception.BadRequestException;
import com.prepwise.exception.ResourceNotFoundException;
import com.prepwise.mapper.ProgressMapper;
import com.prepwise.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProfileRepository profileRepository;

    @Mock
    private SkillRepository skillRepository;

    @Mock
    private UserSkillRepository userSkillRepository;

    @Mock
    private AttemptRepository attemptRepository;

    @Mock
    private ProgressRepository progressRepository;

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private InterviewReportRepository interviewReportRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ProgressMapper progressMapper;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private Profile testProfile;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .name("Alex Johnson")
                .email("alex@prepwise.edu")
                .passwordHash("encoded_pwd")
                .role(Role.STUDENT)
                .onboardingCompleted(true)
                .createdAt(LocalDateTime.now())
                .build();

        testProfile = Profile.builder()
                .id(10L)
                .user(testUser)
                .phone("+1 555-0199")
                .degree("B.Tech")
                .branch("Computer Science")
                .college("Tech Institute")
                .graduationYear(2026)
                .targetRole("Software Engineer")
                .targetCompany("Google")
                .placementStatus("Actively Preparing")
                .githubUrl("https://github.com/alex")
                .linkedinUrl("https://linkedin.com/in/alex")
                .settingsData("{\"emailNotifications\":true}")
                .build();
    }

    @Test
    @DisplayName("Should return user profile with skills")
    void testGetUserProfile() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(testProfile));
        when(userSkillRepository.findByUserId(1L)).thenReturn(Collections.emptyList());

        UserProfileResponse response = userService.getUserProfile(1L);

        assertNotNull(response);
        assertEquals("Alex Johnson", response.getName());
        assertEquals("alex@prepwise.edu", response.getEmail());
        assertEquals("Software Engineer", response.getTargetRole());
        assertEquals("Google", response.getTargetCompany());
        assertEquals("+1 555-0199", response.getPhone());
    }

    @Test
    @DisplayName("Should update user profile fields and skills")
    void testUpdateUserProfile() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(testProfile));
        when(profileRepository.save(any(Profile.class))).thenAnswer(i -> i.getArgument(0));
        when(userSkillRepository.findByUserId(1L)).thenReturn(Collections.emptyList());

        UpdateProfileRequest updateReq = UpdateProfileRequest.builder()
                .name("Alex J. Updated")
                .phone("+1 555-9999")
                .targetRole("Full Stack Engineer")
                .targetCompany("Microsoft")
                .placementStatus("Interviewing")
                .build();

        UserProfileResponse response = userService.updateUserProfile(1L, updateReq);

        assertNotNull(response);
        assertEquals("Alex J. Updated", response.getName());
        assertEquals("+1 555-9999", response.getPhone());
        assertEquals("Full Stack Engineer", response.getTargetRole());
        assertEquals("Microsoft", response.getTargetCompany());
        assertEquals("Interviewing", response.getPlacementStatus());
    }

    @Test
    @DisplayName("Should get user settings")
    void testGetUserSettings() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(testProfile));

        Map<String, Object> settings = userService.getUserSettings(1L);

        assertNotNull(settings);
        assertEquals("Alex Johnson", settings.get("name"));
        assertEquals("alex@prepwise.edu", settings.get("email"));
        assertEquals("{\"emailNotifications\":true}", settings.get("settingsData"));
    }

    @Test
    @DisplayName("Should change password successfully when current password matches")
    void testChangePasswordSuccess() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("old_password", "encoded_pwd")).thenReturn(true);
        when(passwordEncoder.encode("new_password_123")).thenReturn("new_encoded_pwd");

        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("old_password")
                .newPassword("new_password_123")
                .build();

        assertDoesNotThrow(() -> userService.changePassword(1L, request));
        verify(userRepository).save(testUser);
        assertEquals("new_encoded_pwd", testUser.getPasswordHash());
    }

    @Test
    @DisplayName("Should throw BadRequestException when current password does not match")
    void testChangePasswordMismatch() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrong_password", "encoded_pwd")).thenReturn(false);

        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("wrong_password")
                .newPassword("new_password_123")
                .build();

        assertThrows(BadRequestException.class, () -> userService.changePassword(1L, request));
    }

    @Test
    @DisplayName("Should compute user analytics with placement progress metrics")
    void testGetUserAnalytics() {
        QuestionCategory cat = QuestionCategory.builder()
                .id(101L)
                .name("Quantitative Aptitude")
                .moduleType(ModuleType.APTITUDE)
                .build();

        Question q = Question.builder()
                .id(201L)
                .title("Profit and Loss Problem")
                .category(cat)
                .build();

        Attempt attempt = Attempt.builder()
                .id(301L)
                .user(testUser)
                .question(q)
                .isCorrect(true)
                .score(BigDecimal.valueOf(100.0))
                .timeTakenSeconds(60)
                .attemptedAt(LocalDateTime.now())
                .build();

        Progress progress = Progress.builder()
                .id(401L)
                .user(testUser)
                .category(cat)
                .questionsAttempted(1)
                .questionsCorrect(1)
                .accuracy(BigDecimal.valueOf(100.0))
                .build();

        when(attemptRepository.findByUserIdOrderByAttemptedAtDesc(1L)).thenReturn(List.of(attempt));
        when(progressRepository.findByUserId(1L)).thenReturn(List.of(progress));
        when(interviewRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(Collections.emptyList());

        UserAnalyticsResponse analytics = userService.getUserAnalytics(1L);

        assertNotNull(analytics);
        assertEquals(1, analytics.getTotalQuestionsAttempted());
        assertEquals(1, analytics.getTotalQuestionsSolved());
        assertEquals(BigDecimal.valueOf(100.0), analytics.getOverallAccuracy());
        assertNotNull(analytics.getAptitudeProgress());
        assertEquals(1, analytics.getStrongAreas().size());
    }
}
