package com.enclave.organization.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Global exception handler for the Organization Management module.
 * Returns clean, consistent JSON error responses without exposing
 * stack traces or internal implementation details.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(OrganizationNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleOrganizationNotFound(OrganizationNotFoundException ex) {
        ErrorResponse body = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                HttpStatus.NOT_FOUND.getReasonPhrase(),
                ex.getMessage(),
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(MemberNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleMemberNotFound(MemberNotFoundException ex) {
        ErrorResponse body = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                HttpStatus.NOT_FOUND.getReasonPhrase(),
                ex.getMessage(),
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        ValidationErrorResponse body = new ValidationErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "Validation failed",
                LocalDateTime.now(),
                fieldErrors
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException ex) {
        ErrorResponse body = new ErrorResponse(
                HttpStatus.CONFLICT.value(),
                HttpStatus.CONFLICT.getReasonPhrase(),
                ex.getMessage(),
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        ErrorResponse body = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                "Something went wrong. Please try again later.",
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    @Getter
    @AllArgsConstructor
    public static class ErrorResponse {
        private final int status;
        private final String error;
        private final String message;
        private final LocalDateTime timestamp;
    }

    @Getter
    public static class ValidationErrorResponse extends ErrorResponse {
        private final Map<String, String> fieldErrors;

        public ValidationErrorResponse(
                int status,
                String error,
                String message,
                LocalDateTime timestamp,
                Map<String, String> fieldErrors
        ) {
            super(status, error, message, timestamp);
            this.fieldErrors = fieldErrors;
        }
    }
}