package com.ecommerce.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * JPA entity representing an image associated with a {@link Product}.
 * <p>
 * Supports multiple images per product with an explicit display order
 * and a flag to mark the primary/hero image.
 */
@Entity
@Table(name = "product_images")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** URL of the image (e.g., Cloudinary URL). */
    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    /** Alternative text for accessibility and SEO. */
    @Column(name = "alt_text", length = 255)
    private String altText;

    /** Display order — lower values appear first. */
    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    /** True if this is the primary/hero image shown in listings. */
    @Column(name = "is_primary", nullable = false)
    @Builder.Default
    private Boolean isPrimary = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
