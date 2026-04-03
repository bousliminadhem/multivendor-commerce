package com.ecommerce.platform.controller;

import com.ecommerce.platform.dto.OrderDto;
import com.ecommerce.platform.entity.User;
import com.ecommerce.platform.exception.ResourceNotFoundException;
import com.ecommerce.platform.repository.UserRepository;
import com.ecommerce.platform.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;


/**
 * REST controller for order operations.
 * <p>
 * Customers can place orders and view their own order history.
 * Admins can view all orders and update order statuses.
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

        @GetMapping("/vendor")
        @PreAuthorize("hasRole('VENDOR')")
        public ResponseEntity<Page<OrderDto>> getOrdersForVendor(
                @AuthenticationPrincipal User user, // Spring injects your User entity here
                Pageable pageable) {

            return ResponseEntity.ok(orderService.getOrdersByVendor(user.getId(), pageable));
        }

    /**
     * Places a new order for the currently authenticated user.
     */
    @PostMapping
    public ResponseEntity<OrderDto> placeOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody OrderDto orderDto) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User", "email", userDetails.getUsername()));

        OrderDto created = orderService.placeOrder(user.getId(), orderDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Retrieves the order history for the currently authenticated user.
     */
    @GetMapping("/my-orders")
    public ResponseEntity<Page<OrderDto>> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 20) Pageable pageable) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User", "email", userDetails.getUsername()));

        return ResponseEntity.ok(orderService.getOrdersByUser(user.getId(), pageable));
    }

    /**
     * Retrieves a specific order by ID.
     * Customers can only see their own orders; admins can see any order.
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    /**
     * Retrieves orders. Admins get all orders, vendors get their orders if vendorOrders=true.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDOR')")
    public ResponseEntity<Page<OrderDto>> getOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) boolean vendorOrders,
            @PageableDefault(size = 20) Pageable pageable) {
        
        // If vendorOrders flag is set and user is a vendor, return their orders
        if (vendorOrders) {
            User vendor = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "User", "email", userDetails.getUsername()));
            return ResponseEntity.ok(orderService.getOrdersByVendor(vendor.getId(), pageable));
        }
        
        // Otherwise, only admins can proceed
        return ResponseEntity.ok(orderService.getAllOrders(pageable));
    }

    /**
     * Updates the status of an order.
     * Admins can update any order; vendors can update orders containing their products.
     * Accepts a status string in the request parameter.
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDOR')")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }
}
