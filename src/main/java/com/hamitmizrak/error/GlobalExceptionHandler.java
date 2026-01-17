package com.hamitmizrak.error;

import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

/**
 * Global Exception Handler
 * Tüm REST controller'lar için merkezi hata yönetimi sağlar
 * ApiResult<T> formatında standart response döndürür
 */
@Log4j2
@ControllerAdvice
public class GlobalExceptionHandler {

    // BadRequestException
    public class BadRequestException extends RuntimeException {
        public BadRequestException(String message) {
            super(message);
        }
    }

    // ResourceNotFoundException
    public class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String message) {
            super(message);
        }
    }

    // UnauthorizedException
    public class UnauthorizedException extends RuntimeException {
        public UnauthorizedException(String message) {
            super(message);
        }
    }

    // ForbiddenException
    public class ForbiddenException extends RuntimeException {
        public ForbiddenException(String message) {
            super(message);
        }
    }


    /**
     * Validation hatalarını yakalar (Spring @Valid ile gelen)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResult<Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex, WebRequest request) {

        Map<String, Object> validationErrors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            validationErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        ApiResult<Object> apiResult = ApiResult.<Object>builder()
                .status(ApiResult.Status.UNPROCESSABLE)
                .message("Validation Hataları")
                .path(request.getDescription(false).replace("uri=", ""))
                .errors(validationErrors)
                .build();

        return new ResponseEntity<>(apiResult, HttpStatus.BAD_REQUEST);
    }

    /**
     * Not Found (404) hatalarını yakalar
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResult<Object>> handleNotFound(ResourceNotFoundException ex, WebRequest request) {
        ApiResult<Object> apiResult = ApiResult.<Object>builder()
                .status(ApiResult.Status.NOT_FOUND)
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(apiResult, HttpStatus.NOT_FOUND);
    }

    /**
     * Unauthorized (401) hatalarını yakalar
     */
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResult<Object>> handleUnauthorized(UnauthorizedException ex, WebRequest request) {
        ApiResult<Object> apiResult = ApiResult.<Object>builder()
                .status(ApiResult.Status.UNAUTHORIZED)
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(apiResult, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Forbidden (403) hatalarını yakalar
     */
    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiResult<Object>> handleForbidden(ForbiddenException ex, WebRequest request) {
        ApiResult<Object> apiResult = ApiResult.<Object>builder()
                .status(ApiResult.Status.FORBIDDEN)
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(apiResult, HttpStatus.FORBIDDEN);
    }

    /**
     * Bad Request (400) hatalarını yakalar
     */
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResult<Object>> handleBadRequest(BadRequestException ex, WebRequest request) {
        ApiResult<Object> apiResult = ApiResult.<Object>builder()
                .status(ApiResult.Status.UNPROCESSABLE)
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(apiResult, HttpStatus.BAD_REQUEST);
    }

    /**
     * Server Error (500) ve diğer beklenmeyen hatalar
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResult<Object>> handleAllExceptions(Exception ex, WebRequest request) {
        log.error("Global Exception: ", ex);

        ApiResult<Object> apiResult = ApiResult.<Object>builder()
                .status(ApiResult.Status.SERVER_ERROR)
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(apiResult, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
