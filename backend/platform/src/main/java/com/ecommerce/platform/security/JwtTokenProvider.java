package com.ecommerce.platform.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * Utility class for JWT token operations: generation, validation, and
 * claims extraction.
 * <p>
 * The secret key and expiration are injected from {@code application.properties}.
 */
@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long expirationMs;

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs) {
        // Decode the Base64-encoded secret into an HMAC-SHA key
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.expirationMs = expirationMs;
    }

    // ── Token Generation ────────────────────────────────────

    /**
     * Generates a JWT for the authenticated user.
     *
     * @param authentication the Spring Security authentication object
     * @return signed JWT string
     */
    public String generateToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return generateToken(userDetails.getUsername());
    }

    /**
     * Generates a JWT for a given username (email).
     *
     * @param username the subject to embed in the token
     * @return signed JWT string
     */
    public String generateToken(String username) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(username)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    // ── Claims Extraction ───────────────────────────────────

    /**
     * Extracts the username (subject) from a valid JWT.
     */
    public String getUsernameFromToken(String token) {
        return parseClaims(token).getSubject();
    }

    // ── Validation ──────────────────────────────────────────

    /**
     * Validates the JWT signature and expiration.
     *
     * @return {@code true} if the token is valid, {@code false} otherwise
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // Covers: ExpiredJwtException, MalformedJwtException,
            //         UnsupportedJwtException, SignatureException
            return false;
        }
    }

    // ── Internal ────────────────────────────────────────────

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
