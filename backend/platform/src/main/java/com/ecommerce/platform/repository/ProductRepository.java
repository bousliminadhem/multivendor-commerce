package com.ecommerce.platform.repository;

import com.ecommerce.platform.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for {@link Product} entities.
 * <p>
 * Supports pagination for catalog browsing and filtering by category.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    /** Page through all products that belong to a given category. */
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    /** Full-text-style search on product name (case-insensitive LIKE). */
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    /** Page through all products that belong to a given vendor. */
    Page<Product> findByVendorId(Long vendorId, Pageable pageable);
}
