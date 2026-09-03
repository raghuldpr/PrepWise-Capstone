package com.prepwise.service.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prepwise.exception.AIQuotaExceededException;
import com.prepwise.repository.AIRequestRepository;
import com.prepwise.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.net.http.HttpResponse;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DefaultAIProviderClientTest {

    @Mock
    private AIRequestRepository aiRequestRepository;

    @Mock
    private UserRepository userRepository;

    private ObjectMapper objectMapper;
    private DefaultAIProviderClient client;

    @BeforeEach
    void setUp() throws Exception {
        objectMapper = new ObjectMapper();
        client = new DefaultAIProviderClient(aiRequestRepository, userRepository, objectMapper);

        setField(client, "provider", "groq");
        setField(client, "apiKey", "test-groq-api-key");
        setField(client, "model", "qwen/qwen3.8-27b");
        setField(client, "fallbackModel", "qwen/qwen3.8-27b");
        setField(client, "apiBaseUrl", "https://api.groq.com/openai/v1");
        setField(client, "timeoutSeconds", 30);
    }

    @Test
    @DisplayName("Should parse retryDelay from Groq 429 response body and headers")
    void testParseRetryDelayFromResponseBody() throws Exception {
        String jsonBody = """
                {
                  "error": {
                    "message": "Rate limit reached for model qwen/qwen3.8-27b. Please try again in 12.5s.",
                    "type": "tokens",
                    "code": "rate_limit_exceeded"
                  }
                }
                """;

        @SuppressWarnings("unchecked")
        HttpResponse<String> mockResponse = mock(HttpResponse.class);
        when(mockResponse.body()).thenReturn(jsonBody);
        when(mockResponse.headers()).thenReturn(java.net.http.HttpHeaders.of(java.util.Map.of(), (k, v) -> true));

        Method parseMethod = DefaultAIProviderClient.class.getDeclaredMethod("parseRetryDelaySeconds", HttpResponse.class);
        parseMethod.setAccessible(true);
        Integer retryDelaySec = (Integer) parseMethod.invoke(client, mockResponse);

        assertNotNull(retryDelaySec);
        assertEquals(13, retryDelaySec);
    }

    @Test
    @DisplayName("Should parse retryDelay from Retry-After header")
    void testParseRetryDelayFromHeader() throws Exception {
        @SuppressWarnings("unchecked")
        HttpResponse<String> mockResponse = mock(HttpResponse.class);
        when(mockResponse.headers()).thenReturn(java.net.http.HttpHeaders.of(java.util.Map.of("Retry-After", java.util.List.of("15")), (k, v) -> true));

        Method parseMethod = DefaultAIProviderClient.class.getDeclaredMethod("parseRetryDelaySeconds", HttpResponse.class);
        parseMethod.setAccessible(true);
        Integer retryDelaySec = (Integer) parseMethod.invoke(client, mockResponse);

        assertNotNull(retryDelaySec);
        assertEquals(15, retryDelaySec);
    }

    @Test
    @DisplayName("AIQuotaExceededException should contain parsed retry delay")
    void testAIQuotaExceededExceptionRetryDelay() {
        AIQuotaExceededException ex = new AIQuotaExceededException("Rate limit hit", 25);
        assertEquals(25, ex.getRetryDelaySeconds());
        assertEquals("Rate limit hit", ex.getMessage());
    }

    private void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }
}
