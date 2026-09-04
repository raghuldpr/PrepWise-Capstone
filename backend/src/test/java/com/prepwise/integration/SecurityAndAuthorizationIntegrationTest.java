package com.prepwise.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prepwise.dto.*;
import com.prepwise.entity.Role;
import com.prepwise.exception.ResourceNotFoundException;
import com.prepwise.security.JwtService;
import com.prepwise.security.UserPrincipal;
import com.prepwise.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SecurityAndAuthorizationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private UserService userService;

    @MockBean
    private ResumeService resumeService;

    @MockBean
    private InterviewService interviewService;

    @MockBean
    private AIAssistantService aiAssistantService;

    @MockBean
    private AttemptService attemptService;

    @MockBean
    private JwtService jwtService;

    private UserPrincipal studentAPrincipal;
    private UserPrincipal studentBPrincipal;

    @BeforeEach
    void setUp() {
        studentAPrincipal = new UserPrincipal(
                1L,
                "studentA@prepwise.com",
                "",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_STUDENT"))
        );

        studentBPrincipal = new UserPrincipal(
                2L,
                "studentB@prepwise.com",
                "",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_STUDENT"))
        );
    }

    // ==========================================
    // 1. Cross-Student Data Access / Anti-IDOR Tests
    // ==========================================

    @Nested
    @DisplayName("Cross-Student Isolation & Authorization Tests")
    class DataIsolationTests {

        @Test
        @DisplayName("Student A cannot GET Student B's resume - returns 404/403, not Student B's data")
        void studentA_cannotAccessStudentB_resume() throws Exception {
            Long studentBResumeId = 99L;

            // When Student A (id=1) requests resume 99, service throws ResourceNotFoundException because it belongs to Student B
            when(resumeService.getResume(eq(1L), eq(studentBResumeId)))
                    .thenThrow(new ResourceNotFoundException("Resume not found with id: " + studentBResumeId));

            mockMvc.perform(get("/api/resume/{id}", studentBResumeId)
                            .with(user(studentAPrincipal)))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.status").value(404))
                    .andExpect(jsonPath("$.message").value(containsString("Resume not found with id: 99")))
                    .andExpect(jsonPath("$.originalFilename").doesNotExist());

            verify(resumeService, times(1)).getResume(1L, studentBResumeId);
            verify(resumeService, never()).getResume(2L, studentBResumeId);
        }

        @Test
        @DisplayName("Student A cannot GET Student B's resume analysis - returns 404/403, not data")
        void studentA_cannotAccessStudentB_resumeAnalysis() throws Exception {
            Long studentBResumeId = 99L;

            when(resumeService.getResumeAnalysis(eq(1L), eq(studentBResumeId)))
                    .thenThrow(new ResourceNotFoundException("Resume analysis not found for resume id: " + studentBResumeId));

            mockMvc.perform(get("/api/resume/{id}/analysis", studentBResumeId)
                            .with(user(studentAPrincipal)))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.status").value(404))
                    .andExpect(jsonPath("$.strengths").doesNotExist());

            verify(resumeService).getResumeAnalysis(1L, studentBResumeId);
        }

        @Test
        @DisplayName("Student A cannot GET Student B's interview - returns 404/403, not Student B's data")
        void studentA_cannotAccessStudentB_interview() throws Exception {
            Long studentBInterviewId = 88L;

            when(interviewService.getInterview(eq(studentBInterviewId), eq(1L)))
                    .thenThrow(new ResourceNotFoundException("Interview not found with id: " + studentBInterviewId));

            mockMvc.perform(get("/api/interviews/{id}", studentBInterviewId)
                            .with(user(studentAPrincipal)))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.status").value(404))
                    .andExpect(jsonPath("$.title").doesNotExist());

            verify(interviewService).getInterview(studentBInterviewId, 1L);
        }

        @Test
        @DisplayName("Student A cannot GET Student B's interview report - returns 404/403")
        void studentA_cannotAccessStudentB_interviewReport() throws Exception {
            Long studentBInterviewId = 88L;

            when(interviewService.getInterviewReport(eq(studentBInterviewId), eq(1L)))
                    .thenThrow(new ResourceNotFoundException("Interview report not found for id: " + studentBInterviewId));

            mockMvc.perform(get("/api/interviews/{id}/report", studentBInterviewId)
                            .with(user(studentAPrincipal)))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.overallScore").doesNotExist());

            verify(interviewService).getInterviewReport(studentBInterviewId, 1L);
        }

        @Test
        @DisplayName("Student A cannot GET Student B's AI conversation - returns 404/403, not Student B's conversation")
        void studentA_cannotAccessStudentB_aiConversation() throws Exception {
            Long studentBConversationId = 77L;

            when(aiAssistantService.getConversationById(eq(1L), eq(studentBConversationId)))
                    .thenThrow(new ResourceNotFoundException("Conversation not found with id: " + studentBConversationId));

            mockMvc.perform(get("/api/ai/conversations/{id}", studentBConversationId)
                            .with(user(studentAPrincipal)))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.status").value(404))
                    .andExpect(jsonPath("$.title").doesNotExist());

            verify(aiAssistantService).getConversationById(1L, studentBConversationId);
        }

        @Test
        @DisplayName("Student A requesting progress only receives Student A's progress data")
        void studentA_requestingProgress_scopedToStudentAOnly() throws Exception {
            ProgressDto progressStudentA = ProgressDto.builder()
                    .id(10L)
                    .categoryId(1L)
                    .categoryName("Quantitative Aptitude")
                    .questionsAttempted(5)
                    .questionsCorrect(4)
                    .accuracy(BigDecimal.valueOf(80.00))
                    .build();

            when(attemptService.getUserProgress(1L)).thenReturn(List.of(progressStudentA));

            mockMvc.perform(get("/api/progress")
                            .with(user(studentAPrincipal)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").value(10))
                    .andExpect(jsonPath("$[0].categoryName").value("Quantitative Aptitude"));

            verify(attemptService).getUserProgress(1L);
            verify(attemptService, never()).getUserProgress(2L);
        }

        @Test
        @DisplayName("Student A requesting profile receives Student A's profile, not Student B's profile")
        void studentA_requestingProfile_returnsStudentAProfile() throws Exception {
            UserProfileResponse profileA = UserProfileResponse.builder()
                    .id(1L)
                    .name("Student A")
                    .email("studentA@prepwise.com")
                    .role(Role.STUDENT)
                    .targetRole("Backend Engineer")
                    .college("A Institute of Technology")
                    .build();

            when(userService.getUserProfile(1L)).thenReturn(profileA);

            mockMvc.perform(get("/api/users/profile")
                            .with(user(studentAPrincipal)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.name").value("Student A"))
                    .andExpect(jsonPath("$.email").value("studentA@prepwise.com"))
                    .andExpect(jsonPath("$.college").value("A Institute of Technology"));

            verify(userService).getUserProfile(1L);
            verify(userService, never()).getUserProfile(2L);
        }
    }

    // ==========================================
    // 2. Unauthenticated Request Protection Tests
    // ==========================================

    @Nested
    @DisplayName("Unauthenticated Endpoint Protection Tests (Expect 401)")
    class UnauthenticatedEndpointTests {

        @Test
        @DisplayName("GET /api/users/profile unauthenticated returns 401")
        void getProfile_unauthenticated_returns401() throws Exception {
            mockMvc.perform(get("/api/users/profile"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.status").value(401))
                    .andExpect(jsonPath("$.error").value("Unauthorized"));
        }

        @Test
        @DisplayName("GET /api/resume unauthenticated returns 401")
        void getResumes_unauthenticated_returns401() throws Exception {
            mockMvc.perform(get("/api/resume"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.status").value(401));
        }

        @Test
        @DisplayName("GET /api/interviews unauthenticated returns 401")
        void getInterviews_unauthenticated_returns401() throws Exception {
            mockMvc.perform(get("/api/interviews"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.status").value(401));
        }

        @Test
        @DisplayName("GET /api/ai/conversations unauthenticated returns 401")
        void getAiConversations_unauthenticated_returns401() throws Exception {
            mockMvc.perform(get("/api/ai/conversations"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.status").value(401));
        }

        @Test
        @DisplayName("GET /api/progress unauthenticated returns 401")
        void getProgress_unauthenticated_returns401() throws Exception {
            mockMvc.perform(get("/api/progress"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.status").value(401));
        }
    }

    // ==========================================
    // 3. Password Exposure Protection Tests
    // ==========================================

    @Nested
    @DisplayName("Password Privacy & Leak Protection Tests")
    class PasswordPrivacyTests {

        @Test
        @DisplayName("Register response body never exposes password or passwordHash field")
        void registerResponse_doesNotExposePassword() throws Exception {
            RegisterRequest request = RegisterRequest.builder()
                    .name("New Student")
                    .email("newstudent@prepwise.com")
                    .password("SecretPassword123!")
                    .build();

            AuthResponse authResponse = AuthResponse.builder()
                    .token("mock_jwt_token_xyz")
                    .tokenType("Bearer")
                    .id(105L)
                    .email("newstudent@prepwise.com")
                    .name("New Student")
                    .role(Role.STUDENT)
                    .onboardingCompleted(false)
                    .build();

            when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse);

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.token").value("mock_jwt_token_xyz"))
                    .andExpect(jsonPath("$.password").doesNotExist())
                    .andExpect(jsonPath("$.passwordHash").doesNotExist())
                    .andExpect(content().string(not(containsString("SecretPassword123!"))));
        }

        @Test
        @DisplayName("Login response body never exposes password or passwordHash field")
        void loginResponse_doesNotExposePassword() throws Exception {
            LoginRequest request = LoginRequest.builder()
                    .email("studentA@prepwise.com")
            .password("SecretPassword123!")
            .build();

            AuthResponse authResponse = AuthResponse.builder()
                    .token("valid_jwt_token_abc")
                    .tokenType("Bearer")
                    .id(1L)
                    .email("studentA@prepwise.com")
                    .name("Student A")
                    .role(Role.STUDENT)
                    .onboardingCompleted(true)
                    .build();

            when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").value("valid_jwt_token_abc"))
                    .andExpect(jsonPath("$.password").doesNotExist())
                    .andExpect(jsonPath("$.passwordHash").doesNotExist())
                    .andExpect(content().string(not(containsString("SecretPassword123!"))));
        }

        @Test
        @DisplayName("Get user profile response body never exposes password or passwordHash field")
        void profileResponse_doesNotExposePassword() throws Exception {
            UserProfileResponse profileResponse = UserProfileResponse.builder()
                    .id(1L)
                    .name("Student A")
                    .email("studentA@prepwise.com")
                    .role(Role.STUDENT)
                    .onboardingCompleted(true)
                    .college("Tech Institute")
                    .createdAt(LocalDateTime.now())
                    .build();

            when(userService.getUserProfile(1L)).thenReturn(profileResponse);

            mockMvc.perform(get("/api/users/profile")
                            .with(user(studentAPrincipal)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.email").value("studentA@prepwise.com"))
                    .andExpect(jsonPath("$.password").doesNotExist())
                    .andExpect(jsonPath("$.passwordHash").doesNotExist());
        }
    }
}
