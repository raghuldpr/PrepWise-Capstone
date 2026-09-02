package com.prepwise.exception;

public class AIQuotaExceededException extends RuntimeException {
    private final Integer retryDelaySeconds;

    public AIQuotaExceededException(String message) {
        super(message);
        this.retryDelaySeconds = null;
    }

    public AIQuotaExceededException(String message, Integer retryDelaySeconds) {
        super(message);
        this.retryDelaySeconds = retryDelaySeconds;
    }

    public AIQuotaExceededException(String message, Throwable cause) {
        super(message, cause);
        this.retryDelaySeconds = null;
    }

    public AIQuotaExceededException(String message, Integer retryDelaySeconds, Throwable cause) {
        super(message, cause);
        this.retryDelaySeconds = retryDelaySeconds;
    }

    public Integer getRetryDelaySeconds() {
        return retryDelaySeconds;
    }
}

