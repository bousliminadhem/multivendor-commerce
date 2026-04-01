package com.ecommerce.platform.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Standardised API error response returned by the global exception handler.
 * <p>
 * Fields with null values are omitted from the JSON payload
 * ({@code @JsonInclude(NON_NULL)}).
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiErrorResponse {

    private int status;
    private String message;
    private LocalDateTime timestamp;

    /** Field-level validation errors (field name → error message). */
    private Map<String, String> errors;
}
