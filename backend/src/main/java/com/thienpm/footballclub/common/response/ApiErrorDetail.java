package com.thienpm.footballclub.common.response;

public record ApiErrorDetail(
        String field,
        String code,
        String message
) {
}
