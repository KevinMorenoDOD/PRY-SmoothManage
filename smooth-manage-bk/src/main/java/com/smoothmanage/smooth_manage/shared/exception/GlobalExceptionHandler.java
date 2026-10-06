package com.smoothmanage.smooth_manage.shared.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> handleBadCredentials(BadCredentialsException ex, WebRequest request) {
        return build(HttpStatus.UNAUTHORIZED, ex.getMessage(), request);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> handleAuthentication(AuthenticationException ex, WebRequest request) {
        return build(HttpStatus.UNAUTHORIZED, "Authentication failed", request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex, WebRequest request) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrity(DataIntegrityViolationException ex, WebRequest request) {
        String dbMsg = ex.getMostSpecificCause().getMessage();
        String code = mapDbError(dbMsg);
        log.warn("DB integrity violation: code={}, msg={}", code, dbMsg);
        HttpStatus status = code.equals("CYCLE_DETECTED") ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST;
        return build(status, code, request);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiError> handleRuntime(RuntimeException ex, WebRequest request) {
        log.error("Runtime exception: ", ex);
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex, WebRequest request) {
        log.error("Unexpected exception: ", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred", request);
    }

    private String mapDbError(String dbMsg) {
        if (dbMsg == null) return "DB_ERROR";
        String lower = dbMsg.toLowerCase();
        if (lower.contains("not found or not owned")) return "FOLDER_NOT_FOUND";
        if (lower.contains("not a folder")) return "PARENT_NOT_FOLDER";
        if (lower.contains("cycle detected")) return "CYCLE_DETECTED";
        if (lower.contains("duplicate key")) return "DUPLICATE_KEY";
        if (lower.contains("foreign key")) return "FK_VIOLATION";
        return "DB_CONSTRAINT_VIOLATION";
    }

    private ResponseEntity<ApiError> build(HttpStatus status, String message, WebRequest request) {
        ApiError error = new ApiError(
                Instant.now(),
                message,
                request.getDescription(false)
        );
        return ResponseEntity.status(status).body(error);
    }
}