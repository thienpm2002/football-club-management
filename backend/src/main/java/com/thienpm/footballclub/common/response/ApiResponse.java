package com.thienpm.footballclub.common.response;

import java.util.List;

public record ApiResponse<T>(
        boolean success,
        String message,
        T data
) {
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    public static <T> ApiResponse<PaginatedData<T>> successPage(
            String message,
            List<T> items,
            PaginationMetadata pagination
    ) {
        PaginatedData<T> paginatedData =
                new PaginatedData<>(items, pagination);

        return new ApiResponse<>(true, message, paginatedData);
    }
}
