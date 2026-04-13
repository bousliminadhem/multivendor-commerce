package com.ecommerce.platform.repository;

import com.ecommerce.platform.entity.OutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link OutboxEvent} entities.
 */
@Repository
public interface OutboxEventRepository extends JpaRepository<OutboxEvent, UUID> {

    /**
     * Finds all unprocessed outbox events, ordered by creation time.
     * Used by the polling publisher to relay events to the message broker.
     */
    List<OutboxEvent> findByProcessedFalseOrderByCreatedAtAsc();
}
