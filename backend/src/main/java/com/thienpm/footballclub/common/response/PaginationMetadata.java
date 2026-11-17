package com.thienpm.footballclub.common.response;

public record PaginationMetadata(
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean hasNext,
        boolean hasPrevious
) {
}
