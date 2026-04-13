package com.ecommerce.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * JPA entity representing a product in the marketplace.
 * <p>
 * Relationships:
 * <ul>
 *   <li>{@code category} – Many products belong to one {@link Category} (ManyToOne, owning side).</li>
 *   <li>{@code vendor}   – Many products belong to one {@link User} vendor.</li>
 *   <li>{@code images}   – One product has many {@link ProductImage}s.</li>
 * </ul>
 * <p>
 * Supports stock reservation for order processing:
 * <ul>
 *   <li>{@code reservedStock}    – units currently held for pending orders.</li>
 *   <li>{@code reservationExpiry} – when the current reservation window expires.</li>
 * </ul>
 */
@Entity
@Table(name = "products")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Price stored with 2 decimal precision. */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    // ── Stock Reservation ─────────────────────────────────────

    /**
     * Number of units currently reserved by pending orders.
     * Available stock = stockQuantity - reservedStock.
     */
    @Column(name = "reserved_stock", nullable = false)
    @Builder.Default
    private Integer reservedStock = 0;

    /**
     * Expiry time for the current stock reservation.
     * A @Scheduled job releases reservations whose expiry has passed.
     */
    @Column(name = "reservation_expiry")
    private LocalDateTime reservationExpiry;

    // ── Images ────────────────────────────────────────────────

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    /** Gallery of product images. */
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();

    // ── Flexible Attributes (JSONB) ───────────────────────────

    /**
     * Arbitrary key-value attributes (e.g., "color" → "red", "weight" → "1.5kg").
     * Stored as JSONB in PostgreSQL via Hibernate 6's {@code JdbcTypeCode}.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "attributes", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, String> attributes = new HashMap<>();

    // ── Relationships ─────────────────────────────────────────

    /**
     * Many products → one category.
     * LAZY fetch to avoid loading the entire category graph on every product query.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private User vendor;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ── Helper Methods ────────────────────────────────────────

    /**
     * Returns the actually available stock (total minus reserved).
     */
    public int getAvailableStock() {
        return stockQuantity - (reservedStock != null ? reservedStock : 0);
    }

    /**
     * Adds an image, maintaining the bidirectional relationship.
     */
    public void addImage(ProductImage image) {
        images.add(image);
        image.setProduct(this);
    }
}
