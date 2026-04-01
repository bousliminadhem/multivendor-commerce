package com.ecommerce.platform.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for order creation requests and API responses.
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDto {

    private Long id;
    private Long userId;
    private String userEmail;
    private String status;

    /** Computed total — sum of (unitPrice * quantity) for all items. */
    private BigDecimal totalAmount;

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    @NotEmpty(message = "Order must contain at least one item")
    @Valid  // Cascade validation into each OrderItemDto
    private List<OrderItemDto> items;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
