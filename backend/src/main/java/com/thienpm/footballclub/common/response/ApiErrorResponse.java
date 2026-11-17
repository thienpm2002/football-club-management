package com.thienpm.footballclub.common.response;

import java.time.Instant;
import java.util.List;

public record ApiErrorResponse(
        boolean success,
        String message,
        String errorCode,
        List<ApiErrorDetail> errors,
        Instant timestamp,
        String path
) {
}
