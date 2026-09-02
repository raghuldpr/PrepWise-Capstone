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

        setField(client, "provider", "gemini");
        setField(client, "apiKey", "test-api-key");
        setField(client, "model", "gemini-1.5-flash");
        setField(client, "fallbackModel", "gemini-2.0-flash");
        setField(client, "apiBaseUrl", "https://generativelanguage.googleapis.com");
        setField(client, "timeoutSeconds", 30);
    }

    @Test
    @DisplayName("Should parse retryDelay from Gemini 429 response body")
    void testParseRetryDelayFromResponseBody() throws Exception {
        String jsonBody = """
                {
                  "error": {
                    "code": 429,
                    "message": "Quota exceeded. Please retry in 25.231066666s.",
                    "status": "RESOURCE_EXHAUSTED",
                    "details": [
                      {
                        "@type": "type.googleapis.com/google.rpc.RetryInfo",
                        "retryDelay": "25s"
                      }
                    ]
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
        assertEquals(25, retryDelaySec);
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
