package com.ecommerce.platform.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT Authentication Filter — runs once per request, before Spring Security's
 * default authentication filters.
 *
 * <h3>How it works:</h3>
 * <ol>
 *   <li>Extracts the {@code Authorization: Bearer <token>} header.</li>
 *   <li>If a token is present, validates it using {@link JwtTokenProvider}.</li>
 *   <li>If valid, loads the {@link UserDetails} and sets a fully authenticated
 *       {@link UsernamePasswordAuthenticationToken} into the
 *       {@link SecurityContextHolder}.</li>
 *   <li>Downstream filters and controllers see the user as authenticated.</li>
 *   <li>If no token is present or it's invalid, the filter simply continues
 *       the chain — letting Spring Security's defaults handle 401/403.</li>
 * </ol>
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // 1. Extract the JWT from the Authorization header
        String token = extractTokenFromRequest(request);

        // 2. Validate and authenticate
        if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
            String username = jwtTokenProvider.getUsernameFromToken(token);

            // 3. Load user details from the database
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // 4. Build an authentication object and set it in the SecurityContext
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null, // credentials not needed after authentication
                            userDetails.getAuthorities()
                    );
            authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // 5. Continue the filter chain (authenticated or not)
        filterChain.doFilter(request, response);
    }

    /**
     * Extracts the Bearer token from the {@code Authorization} header.
     *
     * @return the raw JWT string, or {@code null} if the header is absent/malformed
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
