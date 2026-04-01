package com.ecommerce.platform.dto;

import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO for exposing user information in API responses.
 * Excludes the password hash for security.
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private LocalDateTime createdAt;
}
