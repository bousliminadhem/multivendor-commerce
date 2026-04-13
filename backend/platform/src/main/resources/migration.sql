-- =============================================================
-- Migration Script — E-Commerce Platform Architectural Refactor
-- =============================================================
-- Run this script against an EXISTING database that was created
-- by the original schema.sql or Hibernate ddl-auto=update.
--
-- This migration covers:
--   1. Categories — add parent_id for recursive hierarchy
--   2. Products   — add reserved_stock, reservation_expiry, attributes (JSONB)
--   3. Product Images — new table for multi-image support
--   4. Outbox Events  — new table for transactional outbox pattern
--   5. Orders     — update status CHECK constraint for new states
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Recursive Categories
-- ─────────────────────────────────────────────────────────────
ALTER TABLE categories
    ADD COLUMN IF NOT EXISTS parent_id BIGINT;

ALTER TABLE categories
    ADD CONSTRAINT fk_categories_parent
    FOREIGN KEY (parent_id) REFERENCES categories(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

-- ─────────────────────────────────────────────────────────────
-- 2. Enhanced Products — Stock Reservation + JSONB Attributes
-- ─────────────────────────────────────────────────────────────
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS reserved_stock INTEGER NOT NULL DEFAULT 0;

ALTER TABLE products
    ADD COLUMN IF NOT EXISTS reservation_expiry TIMESTAMP;

ALTER TABLE products
    ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{}';

-- Add vendor_id if it doesn't exist yet (safe for fresh schemas)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'vendor_id'
    ) THEN
        ALTER TABLE products ADD COLUMN vendor_id BIGINT NOT NULL DEFAULT 1;
        ALTER TABLE products ADD CONSTRAINT fk_products_vendor
            FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_reservation_expiry ON products(reservation_expiry)
    WHERE reserved_stock > 0;

-- ─────────────────────────────────────────────────────────────
-- 3. Product Images
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_images (
    id              BIGSERIAL       PRIMARY KEY,
    product_id      BIGINT          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url       VARCHAR(500)    NOT NULL,
    alt_text        VARCHAR(255),
    display_order   INTEGER         NOT NULL DEFAULT 0,
    is_primary      BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

-- ─────────────────────────────────────────────────────────────
-- 4. Transactional Outbox Events
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS outbox_events (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type  VARCHAR(100)    NOT NULL,
    aggregate_id    VARCHAR(100)    NOT NULL,
    event_type      VARCHAR(100)    NOT NULL,
    payload         JSONB,
    processed       BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_outbox_processed ON outbox_events(processed)
    WHERE processed = FALSE;
CREATE INDEX IF NOT EXISTS idx_outbox_aggregate ON outbox_events(aggregate_type, aggregate_id);

-- ─────────────────────────────────────────────────────────────
-- 5. Update Orders — new status values for state machine
-- ─────────────────────────────────────────────────────────────
-- Drop old CHECK constraint (name may vary; use a DO block for safety)
DO $$
BEGIN
    -- Try dropping named constraint from original schema
    ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Add new CHECK constraint with the expanded state machine values
ALTER TABLE orders
    ADD CONSTRAINT orders_status_check
    CHECK (status IN ('PENDING', 'PAID', 'PACKING', 'SHIPPED', 'DELIVERED', 'CANCELLED'));

-- ─────────────────────────────────────────────────────────────
-- 6. Update Users — add VENDOR role support
-- ─────────────────────────────────────────────────────────────
DO $$
BEGIN
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE users
    ADD CONSTRAINT users_role_check
    CHECK (role IN ('ADMIN', 'CUSTOMER', 'VENDOR'));
