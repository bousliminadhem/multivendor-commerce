package com.ecommerce.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Transactional Outbox entity.
 * <p>
 * Each row represents a domain event that must be delivered to external consumers
 * (e.g., a message broker). Events are written atomically in the same transaction
 * as the aggregate they originate from, guaranteeing at-least-once delivery when
 * combined with a polling publisher or CDC connector.
 */
@Entity
@Table(name = "outbox_events", indexes = {
        @Index(name = "idx_outbox_processed", columnList = "processed")
})
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutboxEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** The aggregate type that produced this event (e.g., "Order"). */
    @Column(name = "aggregate_type", nullable = false, length = 100)
    private String aggregateType;

    /** The ID of the aggregate instance (e.g., Order ID). */
    @Column(name = "aggregate_id", nullable = false, length = 100)
    private String aggregateId;

    /** The event type/name (e.g., "ORDER_CREATED", "ORDER_PAID"). */
    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    /** JSON payload of the event. Stored as JSONB in PostgreSQL. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload", columnDefinition = "jsonb")
    private String payload;

    /** Indicates if this event has been published to the message broker. */
    @Column(nullable = false)
    @Builder.Default
    private Boolean processed = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
