package com.ecommerce.platform.repository;

import com.ecommerce.platform.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for {@link Order} entities.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /** Retrieve paginated orders for a specific user (order history). */
    Page<Order> findByUserId(Long userId, Pageable pageable);
}
