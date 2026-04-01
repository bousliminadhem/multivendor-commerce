package com.ecommerce.platform.security;

import com.ecommerce.platform.entity.User;
import com.ecommerce.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

/**
 * Custom {@link UserDetailsService} that loads user data from the database
 * via {@link UserRepository}.
 * <p>
 * Spring Security calls this during authentication and when the JWT filter
 * needs to reload a user's authorities from a token's subject claim.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Loads a user by email address (used as the username).
     *
     * @param email the user's email
     * @return a Spring Security {@link UserDetails} populated with the user's
     *         role as a granted authority with the {@code ROLE_} prefix
     * @throws UsernameNotFoundException if no user with the given email exists
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found with email: " + email));

        // Map the single Role enum to a GrantedAuthority with ROLE_ prefix
        // e.g. Role.ADMIN → "ROLE_ADMIN"
        SimpleGrantedAuthority authority =
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name());

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.singletonList(authority)
        );
    }
}
