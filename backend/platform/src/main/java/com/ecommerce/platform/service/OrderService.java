package com.ecommerce.platform.service;

import com.ecommerce.platform.dto.OrderDto;
import com.ecommerce.platform.dto.OrderItemDto;
import com.ecommerce.platform.entity.*;
import com.ecommerce.platform.exception.BadRequestException;
import com.ecommerce.platform.exception.ResourceNotFoundException;
import com.ecommerce.platform.repository.OrderRepository;
import com.ecommerce.platform.repository.OutboxEventRepository;
import com.ecommerce.platform.repository.ProductRepository;
import com.ecommerce.platform.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for order placement, status management, and stock reservation.
 * <p>
 * Key design decisions:
 * <ul>
 *   <li><b>Transactional Outbox</b> — {@code placeOrder} writes the Order AND an
 *       {@link OutboxEvent} in the same {@code @Transactional} block, guaranteeing
 *       at-least-once delivery to downstream consumers.</li>
 *   <li><b>Stock Reservation</b> — instead of decrementing stock immediately,
 *       we <em>reserve</em> units for a configurable TTL (default 15 min).
 *       A {@code @Scheduled} job releases expired reservations.</li>
 *   <li><b>State Machine</b> — {@code updateOrderStatus} enforces valid transitions
 *       defined in {@link OrderStatus#canTransitionTo(OrderStatus)}.</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.stock.reservation-ttl-minutes:15}")
    private int reservationTtlMinutes;

    // ── Queries ───────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<OrderDto> getOrdersByVendor(Long vendorId, Pageable pageable) {
        Page<Order> orders = orderRepository.findOrdersByVendorId(vendorId, pageable);

        return orders.map(order -> {
            List<OrderItemDto> vendorItems = order.getItems().stream()
                    .filter(item -> item.getProduct().getVendor().getId().equals(vendorId))
                    .map(this::toItemDto)
                    .collect(Collectors.toList());

            OrderDto dto = toDto(order);
            dto.setItems(vendorItems);

            BigDecimal vendorTotal = vendorItems.stream()
                    .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            dto.setTotalAmount(vendorTotal);

            return dto;
        });
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> getOrdersByUser(Long userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        return toDto(order);
    }

    // ── Order Placement (Outbox + Stock Reservation) ──────────

    /**
     * Places a new order for the given user.
     * <p>
     * Within a single transaction this method:
     * <ol>
     *   <li>Validates product existence and stock availability (considering reservations).</li>
     *   <li>Reserves stock (increments {@code reservedStock}) with a TTL-based expiry.</li>
     *   <li>Snapshots the unit price from the current product price.</li>
     *   <li>Computes the order total.</li>
     *   <li>Persists the Order.</li>
     *   <li>Writes an {@link OutboxEvent} for downstream notification.</li>
     * </ol>
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
        LocalDateTime reservationExpiry = LocalDateTime.now().plusMinutes(reservationTtlMinutes);

        for (OrderItemDto itemDto : dto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product", "id", itemDto.getProductId()));

            int available = product.getAvailableStock();

            // Stock validation against available stock (total - already reserved)
            if (available < itemDto.getQuantity()) {
                throw new BadRequestException(
                        "Insufficient stock for product: " + product.getName()
                        + " (available: " + available
                        + ", requested: " + itemDto.getQuantity() + ")");
            }

            // Reserve stock instead of immediately decrementing
            product.setReservedStock(product.getReservedStock() + itemDto.getQuantity());
            product.setReservationExpiry(reservationExpiry);
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

        // ── Transactional Outbox — same transaction as the order ──
        publishOutboxEvent("Order", saved.getId().toString(), "ORDER_CREATED",
                Map.of(
                        "orderId", saved.getId(),
                        "userId", userId,
                        "totalAmount", total,
                        "status", saved.getStatus().name()
                ));

        return toDto(saved);
    }

    // ── State Machine Transitions ─────────────────────────────

    /**
     * Updates the status of an existing order, enforcing the state machine.
     * <p>
     * On the {@code PENDING → PAID} transition, reserved stock is converted to
     * a permanent decrement (reservedStock reduced, stockQuantity reduced).
     *
     * @throws BadRequestException if the transition is not allowed
     */
    @Transactional
    public OrderDto updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));

        OrderStatus targetStatus;
        try {
            targetStatus = OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid order status: " + status);
        }

        OrderStatus currentStatus = order.getStatus();

        // Enforce the state machine
        if (!currentStatus.canTransitionTo(targetStatus)) {
            throw new BadRequestException(
                    "Cannot transition order from " + currentStatus + " to " + targetStatus
                    + ". Allowed transitions from " + currentStatus + ": "
                    + getAllowedTransitions(currentStatus));
        }

        // On PENDING → PAID: convert reservation to permanent stock decrement
        if (currentStatus == OrderStatus.PENDING && targetStatus == OrderStatus.PAID) {
            confirmStockReservation(order);
        }

        // On PENDING → CANCELLED: release reserved stock
        if (currentStatus == OrderStatus.PENDING && targetStatus == OrderStatus.CANCELLED) {
            releaseStockForOrder(order);
        }

        order.setStatus(targetStatus);
        Order saved = orderRepository.save(order);

        // Outbox event for the status change
        publishOutboxEvent("Order", saved.getId().toString(),
                "ORDER_STATUS_CHANGED",
                Map.of(
                        "orderId", saved.getId(),
                        "fromStatus", currentStatus.name(),
                        "toStatus", targetStatus.name()
                ));

        return toDto(saved);
    }

    // ── Scheduled Reservation Cleanup ─────────────────────────

    /**
     * Runs every 60 seconds to release expired stock reservations.
     * <p>
     * Any PENDING order whose products' reservation expiry has passed will
     * have its reserved stock released and the order cancelled.
     */
    @Scheduled(fixedRateString = "60000")
    @Transactional
    public void releaseExpiredReservations() {
        LocalDateTime now = LocalDateTime.now();

        List<Product> expiredProducts = productRepository.findAll().stream()
                .filter(p -> p.getReservedStock() > 0
                        && p.getReservationExpiry() != null
                        && p.getReservationExpiry().isBefore(now))
                .toList();

        for (Product product : expiredProducts) {
            log.info("Releasing expired reservation: product={}, reservedStock={}",
                    product.getId(), product.getReservedStock());
            product.setReservedStock(0);
            product.setReservationExpiry(null);
            productRepository.save(product);
        }

        if (!expiredProducts.isEmpty()) {
            log.info("Released expired reservations for {} product(s)", expiredProducts.size());
        }
    }

    // ── Private Helpers ───────────────────────────────────────

    /**
     * Converts reserved stock to a permanent decrement upon payment confirmation.
     */
    private void confirmStockReservation(Order order) {
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            int qty = item.getQuantity();

            product.setStockQuantity(product.getStockQuantity() - qty);
            product.setReservedStock(Math.max(0, product.getReservedStock() - qty));

            if (product.getReservedStock() == 0) {
                product.setReservationExpiry(null);
            }

            productRepository.save(product);
        }
    }

    /**
     * Releases reserved stock when an order is cancelled.
     */
    private void releaseStockForOrder(Order order) {
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            int qty = item.getQuantity();

            product.setReservedStock(Math.max(0, product.getReservedStock() - qty));

            if (product.getReservedStock() == 0) {
                product.setReservationExpiry(null);
            }

            productRepository.save(product);
        }
    }

    /**
     * Writes an outbox event in the current transaction.
     */
    private void publishOutboxEvent(String aggregateType, String aggregateId,
                                    String eventType, Map<String, Object> data) {
        String payload;
        try {
            payload = objectMapper.writeValueAsString(data);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize outbox event payload", e);
            payload = "{}";
        }

        OutboxEvent event = OutboxEvent.builder()
                .aggregateType(aggregateType)
                .aggregateId(aggregateId)
                .eventType(eventType)
                .payload(payload)
                .build();

        outboxEventRepository.save(event);
    }

    private String getAllowedTransitions(OrderStatus status) {
        StringBuilder sb = new StringBuilder("[");
        for (OrderStatus s : OrderStatus.values()) {
            if (status.canTransitionTo(s)) {
                if (sb.length() > 1) sb.append(", ");
                sb.append(s.name());
            }
        }
        sb.append("]");
        return sb.toString();
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
