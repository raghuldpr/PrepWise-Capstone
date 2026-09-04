package com.prepwise.service;

import com.prepwise.dto.AuthResponse;
import com.prepwise.dto.LoginRequest;
import com.prepwise.dto.RegisterRequest;
import com.prepwise.dto.UserProfileResponse;
import com.prepwise.entity.Profile;
import com.prepwise.entity.Role;
import com.prepwise.entity.User;
import com.prepwise.exception.ResourceNotFoundException;
import com.prepwise.exception.UserAlreadyExistsException;
import com.prepwise.repository.ProfileRepository;
import com.prepwise.repository.UserRepository;
import com.prepwise.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProfileRepository profileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User testUser;

    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
                .name("Jane Doe")
                .email("jane.doe@example.com")
                .password("SecurePass123!")
                .build();

        loginRequest = LoginRequest.builder()
                .email("jane.doe@example.com")
                .password("SecurePass123!")
                .build();

        testUser = User.builder()
                .id(1L)
                .name("Jane Doe")
                .email("jane.doe@example.com")
                .passwordHash("encoded_password_hash")
                .role(Role.STUDENT)
                .isActive(true)
                .onboardingCompleted(false)
                .build();
    }

    // ==========================================
    // Registration Tests
    // ==========================================

    @Test
    @DisplayName("register: throws UserAlreadyExistsException when email is duplicate")
    void register_whenEmailAlreadyExists_throwsUserAlreadyExistsException() {
        // Arrange
        when(userRepository.existsByEmail("jane.doe@example.com")).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(UserAlreadyExistsException.class)
                .hasMessageContaining("Email is already registered: jane.doe@example.com");

        verify(userRepository, times(1)).existsByEmail("jane.doe@example.com");
        verify(userRepository, never()).save(any());
        verify(profileRepository, never()).save(any());
        verify(jwtService, never()).generateToken(any(), any(), any());
    }

    @Test
    @DisplayName("register: saves User and Profile and returns AuthResponse on valid input")
    void register_whenEmailIsNew_successfullyRegistersUser() {
        // Arrange
        when(userRepository.existsByEmail("jane.doe@example.com")).thenReturn(false);
        when(passwordEncoder.encode("SecurePass123!")).thenReturn("encoded_password_hash");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtService.generateToken(1L, "jane.doe@example.com", Role.STUDENT))
                .thenReturn("mock_jwt_token_12345");

        // Act
        AuthResponse response = authService.register(registerRequest);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mock_jwt_token_12345");
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getEmail()).isEqualTo("jane.doe@example.com");
        assertThat(response.getName()).isEqualTo("Jane Doe");
        assertThat(response.getRole()).isEqualTo(Role.STUDENT);
        assertThat(response.getOnboardingCompleted()).isFalse();

        verify(userRepository).existsByEmail("jane.doe@example.com");
        verify(passwordEncoder).encode("SecurePass123!");
        verify(userRepository).save(any(User.class));
        verify(profileRepository).save(any(Profile.class));
        verify(jwtService).generateToken(1L, "jane.doe@example.com", Role.STUDENT);
    }

    // ==========================================
    // Login Tests
    // ==========================================

    @Test
    @DisplayName("login: throws BadCredentialsException when authentication fails")
    void login_whenInvalidCredentials_throwsBadCredentialsException() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        // Act & Assert
        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Invalid credentials");

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository, never()).findByEmail(anyString());
        verify(jwtService, never()).generateToken(any(), any(), any());
    }

    @Test
    @DisplayName("login: throws ResourceNotFoundException when user record is missing post-auth")
    void login_whenUserNotFoundInDatabase_throwsResourceNotFoundException() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null);
        when(userRepository.findByEmail("jane.doe@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found with email: jane.doe@example.com");

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).findByEmail("jane.doe@example.com");
        verify(jwtService, never()).generateToken(any(), any(), any());
    }

    @Test
    @DisplayName("login: returns AuthResponse with JWT token on valid credentials")
    void login_whenCredentialsAreValid_returnsAuthResponse() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null);
        when(userRepository.findByEmail("jane.doe@example.com")).thenReturn(Optional.of(testUser));
        when(jwtService.generateToken(1L, "jane.doe@example.com", Role.STUDENT))
                .thenReturn("valid_login_jwt_token");

        // Act
        AuthResponse response = authService.login(loginRequest);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("valid_login_jwt_token");
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getEmail()).isEqualTo("jane.doe@example.com");
        assertThat(response.getRole()).isEqualTo(Role.STUDENT);

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).findByEmail("jane.doe@example.com");
        verify(jwtService).generateToken(1L, "jane.doe@example.com", Role.STUDENT);
    }

    // ==========================================
    // User Profile Test
    // ==========================================

    @Test
    @DisplayName("getUserProfile: returns profile response for valid user ID")
    void getUserProfile_whenUserExists_returnsProfileResponse() {
        // Arrange
        Profile profile = Profile.builder()
                .id(10L)
                .user(testUser)
                .education("B.Tech Computer Science")
                .college("Tech University")
                .targetRole("Software Engineer")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));

        // Act
        UserProfileResponse response = authService.getUserProfile(1L);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getEmail()).isEqualTo("jane.doe@example.com");
        assertThat(response.getEducation()).isEqualTo("B.Tech Computer Science");
        assertThat(response.getCollege()).isEqualTo("Tech University");
        assertThat(response.getTargetRole()).isEqualTo("Software Engineer");
    }

    @Test
    @DisplayName("verifySeededPassword: Spring BCryptPasswordEncoder correctly matches Password123! with seeded hash")
    void verifySeededPasswordMatchesBcryptHash() {
        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder = 
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        String seededHash = "$2b$10$9WCweUgaaWVUvZo7Qoj8A.dBbm3RaoHswGubGmVp0fxKE0qtCIUnG";
        
        boolean matches = encoder.matches("Password123!", seededHash);
        assertThat(matches).isTrue();

        boolean wrongMatches = encoder.matches("WrongPassword", seededHash);
        assertThat(wrongMatches).isFalse();
    }
}
