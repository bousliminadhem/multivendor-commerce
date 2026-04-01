package com.ecommerce.platform.dto;

import lombok.*;

/**
 * DTO returned after a successful authentication.
 * Contains the JWT access token and basic user metadata.
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private String tokenType;
    private Long userId;
    private String email;
    private String role;
}
