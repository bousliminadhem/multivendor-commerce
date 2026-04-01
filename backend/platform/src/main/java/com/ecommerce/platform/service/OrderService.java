package com.ecommerce.platform.service;

import com.ecommerce.platform.dto.OrderDto;
import com.ecommerce.platform.dto.OrderItemDto;
import com.ecommerce.platform.entity.*;
import com.ecommerce.platform.exception.BadRequestException;
import com.ecommerce.platform.exception.ResourceNotFoundException;
import com.ecommerce.platform.repository.OrderRepository;
import com.ecommerce.platform.repository.ProductRepository;
import com.ecommerce.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for order placement and retrieval.
 * <p>
 * When placing an order this service:
 * <ol>
 *   <li>Validates product existence and stock availability.</li>
 *   <li>Snapshots the unit price from the current product price.</li>
 *   <li>Decrements stock quantities.</li>
 *   <li>Computes the order total.</li>
 * </ol>
 */
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    /**
     * Places a new order for the given user.
     */
    @Transactional
    public OrderDto placeOrder(Long userId, OrderDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Order order = Order.builder()
                .user(user)
                .shippingAddress(dto.getShippingAddress())
                .status(OrderStatus.PENDING)
                .build();

        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemDto itemDto : dto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product", "id", itemDto.getProductId()));

            // Stock validation
            if (product.getStockQuantity() < itemDto.getQuantity()) {
                throw new BadRequestException(
                        "Insufficient stock for product: " + product.getName()
                        + " (available: " + product.getStockQuantity()
                        + ", requested: " + itemDto.getQuantity() + ")");
            }

            // Decrement stock
            product.setStockQuantity(product.getStockQuantity() - itemDto.getQuantity());
            productRepository.save(product);

            // Snapshot the price and build the order item
            OrderItem item = OrderItem.builder()
                    .product(product)
                    .quantity(itemDto.getQuantity())
                    .unitPrice(product.getPrice())
                    .build();

            order.addItem(item);

            total = total.add(product.getPrice()
                    .multiply(BigDecimal.valueOf(itemDto.getQuantity())));
        }

        order.setTotalAmount(total);
        Order saved = orderRepository.save(order);

        return toDto(saved);
    }

    /**
     * Retrieves a paginated list of orders for a specific user.
     */
    @Transactional(readOnly = true)
    public Page<OrderDto> getOrdersByUser(Long userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable).map(this::toDto);
    }

    /**
     * Retrieves all orders (admin).
     */
    @Transactional(readOnly = true)
    public Page<OrderDto> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(this::toDto);
    }

    /**
     * Retrieves a single order by ID.
     */
    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        return toDto(order);
    }

    /**
     * Updates the status of an existing order (admin action).
     */
    @Transactional
    public OrderDto updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));

        try {
            order.setStatus(OrderStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid order status: " + status);
        }

        return toDto(orderRepository.save(order));
    }

    // ── Entity → DTO Mapping ────────────────────────────────

    private OrderDto toDto(Order order) {
        List<OrderItemDto> itemDtos = order.getItems().stream()
                .map(this::toItemDto)
                .collect(Collectors.toList());

        return OrderDto.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .userEmail(order.getUser().getEmail())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .items(itemDtos)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private OrderItemDto toItemDto(OrderItem item) {
        return OrderItemDto.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .build();
    }
}
