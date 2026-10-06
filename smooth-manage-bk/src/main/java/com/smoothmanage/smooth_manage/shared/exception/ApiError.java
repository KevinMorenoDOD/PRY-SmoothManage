package com.smoothmanage.smooth_manage.shared.exception;

import java.time.Instant;

public class ApiError {
    private final Instant timestamp;
    private final String message;
    private final String details;

    public ApiError(Instant timestamp, String message, String details) {
        this.timestamp = timestamp;
        this.message = message;
        this.details = details;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public String getMessage() {
        return message;
    }

    public String getDetails() {
        return details;
    }
}