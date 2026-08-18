package com.prepwise.exception;

public class AIProviderUnavailableException extends RuntimeException {
    public AIProviderUnavailableException(String message) {
        super(message);
    }

    public AIProviderUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
