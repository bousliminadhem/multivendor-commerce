package com.ecommerce.platform.repository;

import com.ecommerce.platform.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for {@link Category} entities.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /** Find a category by its unique name. */
    Optional<Category> findByName(String name);

    /** Check whether a category name already exists. */
    boolean existsByName(String name);
}
