package com.thienpm.footballclub.common.validation;

import java.util.Map;

public final class ValidationErrorCodeMapper {

    private static final Map<String, String> ERROR_CODE_MAPPING = Map.ofEntries(
            Map.entry("NotNull", "REQUIRED"),
            Map.entry("NotBlank", "REQUIRED"),
            Map.entry("NotEmpty", "REQUIRED"),
            Map.entry("Email", "INVALID_FORMAT"),
            Map.entry("Pattern", "INVALID_FORMAT"),
            Map.entry("Size", "INVALID_LENGTH"),
            Map.entry("Min", "OUT_OF_RANGE"),
            Map.entry("Max", "OUT_OF_RANGE"),
            Map.entry("Positive", "INVALID_VALUE")
    );

    private ValidationErrorCodeMapper() {
    }

    public static String map(String validationCode) {
        return ERROR_CODE_MAPPING.getOrDefault(
                validationCode,
                "INVALID_VALUE"
        );
    }
}
