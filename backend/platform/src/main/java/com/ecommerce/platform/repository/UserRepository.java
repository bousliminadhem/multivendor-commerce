package com.ecommerce.platform.repository;

import com.ecommerce.platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for {@link User} entities.
 * <p>
 * Provides CRUD operations plus custom finder methods used
 * by the authentication and user-management layers.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /** Find a user by their unique email address (used during login). */
    Optional<User> findByEmail(String email);

    /** Check whether an email is already registered (used during signup). */
    boolean existsByEmail(String email);
}
