package com.prepwise.exception;

public class AIQuotaExceededException extends RuntimeException {
    public AIQuotaExceededException(String message) {
        super(message);
    }

    public AIQuotaExceededException(String message, Throwable cause) {
        super(message, cause);
    }
}
