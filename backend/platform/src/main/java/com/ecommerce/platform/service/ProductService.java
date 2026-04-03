package com.ecommerce.platform.service;

import com.ecommerce.platform.dto.ProductDto;
import com.ecommerce.platform.entity.Category;
import com.ecommerce.platform.entity.Product;
import com.ecommerce.platform.entity.User;
import com.ecommerce.platform.exception.ResourceNotFoundException;
import com.ecommerce.platform.repository.CategoryRepository;
import com.ecommerce.platform.repository.ProductRepository;
import com.ecommerce.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for product catalog operations.
 */
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<ProductDto> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<ProductDto> getProductsByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findByCategoryId(categoryId, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<ProductDto> getProductsByVendor(Long vendorId, Pageable pageable) {
        return productRepository.findByVendorId(vendorId, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<ProductDto> searchProducts(String name, Pageable pageable) {
        return productRepository.findByNameContainingIgnoreCase(name, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public ProductDto getProductById(Long id) {
        Product product = findOrThrow(id);
        return toDto(product);
    }

        @Transactional
        public ProductDto createProduct(Long authenticatedUserId, ProductDto dto) {
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoryId()));

        User vendor = userRepository.findById(authenticatedUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", authenticatedUserId));

        Product product = Product.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .stockQuantity(dto.getStockQuantity())
                .imageUrl(dto.getImageUrl())
                .category(category)
            .vendor(vendor)
                .build();

        return toDto(productRepository.save(product));
    }

    @Transactional
    public ProductDto updateProduct(Long id, Long authenticatedUserId, ProductDto dto) {
        Product product = findOrThrow(id);

        enforceOwnership(product, authenticatedUserId);

        // Update category if changed
        if (!product.getCategory().getId().equals(dto.getCategoryId())) {
            Category newCategory = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoryId()));
            product.setCategory(newCategory);
        }

        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setImageUrl(dto.getImageUrl());

        return toDto(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id, Long authenticatedUserId) {
        Product product = findOrThrow(id);

        enforceOwnership(product, authenticatedUserId);
        productRepository.delete(product);
    }

    // ── Helpers ─────────────────────────────────────────────

    private Product findOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }

    private ProductDto toDto(Product p) {
        return ProductDto.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .stockQuantity(p.getStockQuantity())
                .imageUrl(p.getImageUrl())
                .categoryId(p.getCategory().getId())
                .categoryName(p.getCategory().getName())
                .vendorId(p.getVendor() != null ? p.getVendor().getId() : null)
                .vendorName(p.getVendor() != null ? p.getVendor().getFirstName() + " " + p.getVendor().getLastName() : null)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    private void enforceOwnership(Product product, Long authenticatedUserId) {
        Long ownerId = product.getVendor() != null ? product.getVendor().getId() : null;
        if (ownerId == null || !ownerId.equals(authenticatedUserId)) {
            throw new AccessDeniedException("You are not allowed to modify this product");
        }
    }
}
