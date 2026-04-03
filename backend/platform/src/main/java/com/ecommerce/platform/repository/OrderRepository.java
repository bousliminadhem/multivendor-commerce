package com.ecommerce.platform.repository;

import com.ecommerce.platform.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for {@link Order} entities.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /** Retrieve paginated orders for a specific user (order history). */
    Page<Order> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT DISTINCT o FROM Order o JOIN o.items i WHERE i.product.vendor.id = :vendorId")
    Page<Order> findOrdersByVendorId(@Param("vendorId") Long vendorId, Pageable pageable);
}

