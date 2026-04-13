package com.ecommerce.platform.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Idempotency filter for HTTP requests.
 * <p>
 * When a client includes an {@code X-Idempotency-Key} header on a mutating
 * request (POST, PUT, PATCH), this filter caches the response and replays it
 * for any subsequent request with the same key — preventing duplicate
 * side-effects (e.g., double order placement).
 * <p>
 * <b>Implementation Notes:</b>
 * <ul>
 *   <li>Uses an in-memory {@link ConcurrentHashMap} for simplicity. For
 *       production clusters, swap this for a Redis-based implementation
 *       (e.g., Spring Data Redis {@code ValueOperations} with TTL).</li>
 *   <li>GET, DELETE, OPTIONS, and HEAD requests are idempotent by definition
 *       and are therefore excluded from caching.</li>
 * </ul>
 */
@Slf4j
@Component
public class IdempotencyFilter extends OncePerRequestFilter {

    private static final String IDEMPOTENCY_HEADER = "X-Idempotency-Key";

    /**
     * In-memory cache mapping idempotency keys to cached responses.
     * <p>
     * For production, replace with Redis:
     * <pre>
     *   &#64;Autowired StringRedisTemplate redis;
     *   redis.opsForValue().set(key, json, Duration.ofHours(24));
     * </pre>
     */
    private final Map<String, CachedResponse> cache = new ConcurrentHashMap<>();

    private final ObjectMapper objectMapper;

    public IdempotencyFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String idempotencyKey = request.getHeader(IDEMPOTENCY_HEADER);

        // No key → pass through
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        // Skip idempotent HTTP methods
        String method = request.getMethod().toUpperCase();
        if ("GET".equals(method) || "DELETE".equals(method)
                || "OPTIONS".equals(method) || "HEAD".equals(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Check cache — replay if present
        CachedResponse cached = cache.get(idempotencyKey);
        if (cached != null) {
            log.info("Replaying cached response for idempotency key: {}", idempotencyKey);
            response.setStatus(cached.status);
            response.setContentType(cached.contentType);
            response.getOutputStream().write(cached.body);
            return;
        }

        // Wrap response to capture the output
        ContentCachingResponseWrapper wrappedResponse =
                new ContentCachingResponseWrapper(response);

        filterChain.doFilter(request, wrappedResponse);

        // Only cache successful responses (2xx)
        int status = wrappedResponse.getStatus();
        if (status >= 200 && status < 300) {
            byte[] body = wrappedResponse.getContentAsByteArray();
            String contentType = wrappedResponse.getContentType();

            cache.put(idempotencyKey, new CachedResponse(status, contentType, body));
            log.debug("Cached response for idempotency key: {}", idempotencyKey);
        }

        // IMPORTANT: copy the cached body to the actual response
        wrappedResponse.copyBodyToResponse();
    }

    /**
     * Internal record holding cached HTTP response data.
     */
    private record CachedResponse(int status, String contentType, byte[] body) {}
}
