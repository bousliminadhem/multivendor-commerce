package com.ecommerce.platform.entity;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Enum representing the lifecycle states of an order.
 * <p>
 * Valid transitions (state machine):
 * <pre>
 *   PENDING  → PAID
 *   PAID     → PACKING
 *   PACKING  → SHIPPED
 *   SHIPPED  → DELIVERED
 *   PENDING  → CANCELLED
 * </pre>
 */
public enum OrderStatus {
    PENDING,
    PAID,
    PACKING,
    SHIPPED,
    DELIVERED,
    CANCELLED;

    /**
     * Map of each status to the set of statuses it can transition to.
     */
    private static final Map<OrderStatus, Set<OrderStatus>> VALID_TRANSITIONS = Map.of(
            PENDING,   EnumSet.of(PAID, CANCELLED),
            PAID,      EnumSet.of(PACKING),
            PACKING,   EnumSet.of(SHIPPED),
            SHIPPED,   EnumSet.of(DELIVERED),
            DELIVERED, EnumSet.noneOf(OrderStatus.class),
            CANCELLED, EnumSet.noneOf(OrderStatus.class)
    );

    /**
     * Checks if transitioning from this status to the given target is valid.
     *
     * @param target the desired target status
     * @return true if the transition is allowed
     */
    public boolean canTransitionTo(OrderStatus target) {
        return VALID_TRANSITIONS.getOrDefault(this, EnumSet.noneOf(OrderStatus.class))
                .contains(target);
    }
}
