package com.ecommerce.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA entity representing a product category.
 * <p>
 * Supports recursive (self-referencing) hierarchies: each category may have
 * a {@code parentCategory} and any number of {@code subCategories}.
 * <p>
 * Each category has a unique name and can contain many {@link Product}s.
 * The {@code products} list is mapped by the owning side in {@link Product#category}.
 */
@Entity
@Table(name = "categories", uniqueConstraints = {
        @UniqueConstraint(columnNames = "name")
})
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    // ── Recursive Hierarchy ───────────────────────────────────

    /**
     * Parent category. {@code null} for root-level categories.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parentCategory;

    /**
     * Direct children of this category.
     * Cascade ALL so saving a parent also persists new children.
     */
    @OneToMany(mappedBy = "parentCategory", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Category> subCategories = new ArrayList<>();

    // ── Products ──────────────────────────────────────────────

    /** One category → many products (inverse side). */
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Product> products = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ── Helper Methods ────────────────────────────────────────

    /**
     * Adds a sub-category, maintaining the bidirectional relationship.
     */
    public void addSubCategory(Category child) {
        subCategories.add(child);
        child.setParentCategory(this);
    }
}
