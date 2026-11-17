package com.thienpm.footballclub.common.response;

import java.util.List;

public record PaginatedData<T>(
        List<T> items,
        PaginationMetadata pagination
) {
}
