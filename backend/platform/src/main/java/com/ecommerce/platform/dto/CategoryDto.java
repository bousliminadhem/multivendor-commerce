package com.ecommerce.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for category creation/update requests and API responses.
 * <p>
 * Supports recursive hierarchies: a category can reference a
 * {@code parentCategoryId} to become a sub-category, and the response
 * includes nested {@code subCategories}.
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryDto {

    private Long id;

    @NotBlank(message = "Category name is required")
    @Size(max = 150, message = "Category name must not exceed 150 characters")
    private String name;

    private String description;

    /** Null for root categories. Set to a valid category ID to nest under. */
    private Long parentCategoryId;

    /** Parent category name — populated in responses for display convenience. */
    private String parentCategoryName;

    /** Direct children of this category — populated in responses. */
    private List<CategoryDto> subCategories;

    private LocalDateTime createdAt;
}
