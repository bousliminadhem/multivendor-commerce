package com.ecommerce.platform.repository;

import com.ecommerce.platform.dto.VendorAnalyticsDto;
import com.ecommerce.platform.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link Order} entities.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /** Retrieve paginated orders for a specific user (order history). */
    Page<Order> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT DISTINCT o FROM Order o JOIN o.items i WHERE i.product.vendor.id = :vendorId")
    Page<Order> findOrdersByVendorId(@Param("vendorId") Long vendorId, Pageable pageable);

    // ── Vendor Analytics ─────────────────────────────────────

    /**
     * Aggregates revenue and order count for a specific vendor.
     * <p>
     * Sums (unitPrice * quantity) for all order items whose product belongs
     * to the given vendor, and counts the distinct orders containing those items.
     *
     * @param vendorId the vendor's user ID
     * @return a single-element list with the analytics DTO (empty if no data)
     */
    @Query("""
            SELECT new com.ecommerce.platform.dto.VendorAnalyticsDto(
                i.product.vendor.id,
                SUM(i.unitPrice * i.quantity),
                COUNT(DISTINCT i.order.id)
            )
            FROM OrderItem i
            WHERE i.product.vendor.id = :vendorId
            GROUP BY i.product.vendor.id
            """)
    List<VendorAnalyticsDto> getVendorAnalytics(@Param("vendorId") Long vendorId);

    /**
     * Aggregates revenue and order count for ALL vendors.
     * <p>
     * Useful for admin dashboards and platform-wide reporting.
     */
    @Query("""
            SELECT new com.ecommerce.platform.dto.VendorAnalyticsDto(
                i.product.vendor.id,
                SUM(i.unitPrice * i.quantity),
                COUNT(DISTINCT i.order.id)
            )
            FROM OrderItem i
            GROUP BY i.product.vendor.id
            ORDER BY SUM(i.unitPrice * i.quantity) DESC
            """)
    List<VendorAnalyticsDto> getAllVendorAnalytics();
}
