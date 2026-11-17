package com.thienpm.footballclub.common.exception;

import com.thienpm.footballclub.common.response.ApiErrorDetail;
import com.thienpm.footballclub.common.response.ApiErrorResponse;
import com.thienpm.footballclub.common.validation.ValidationErrorCodeMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import lombok.extern.slf4j.Slf4j;

import java.time.Instant;
import java.util.List;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Xử lý Validation Error
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ) {
        List<ApiErrorDetail> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(fieldError -> new ApiErrorDetail(
                        fieldError.getField(),
                        ValidationErrorCodeMapper.map(fieldError.getCode()),
                        fieldError.getDefaultMessage()
                ))
                .toList();

        ApiErrorResponse body = new ApiErrorResponse(
                false,
                "Validation failed",
                "VALIDATION_ERROR",
                errors,
                Instant.now(),
                request.getRequestURI()
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(body);
    }

    // Xử lý các lỗi không tìm thấy tài nguyên
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleResourceNotFoundException(
            ResourceNotFoundException ex,
            HttpServletRequest request
    ) {
        ApiErrorResponse body = new ApiErrorResponse(
                false,
                ex.getMessage(),
                "RESOURCE_NOT_FOUND",
                List.of(),
                Instant.now(),
                request.getRequestURI()
        );

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(body);
    }

    // Xử lý các lỗi không mong muốn (500 Internal Server Error)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGlobalException(
            Exception ex,
            HttpServletRequest request
    ) {
        ApiErrorResponse body = new ApiErrorResponse(
                false,
                "Internal server error",
                "INTERNAL_SERVER_ERROR",
                List.of(),
                Instant.now(),
                request.getRequestURI()
        );

        log.error("Unexpected error occurred at path: {}", request.getRequestURI(), ex);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(body);
    }
}
