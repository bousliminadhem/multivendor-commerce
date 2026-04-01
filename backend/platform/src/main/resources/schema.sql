-- =============================================================
-- Multi-Vendor E-Commerce Platform — PostgreSQL Schema
-- =============================================================
-- This file is provided as a reference. Hibernate's ddl-auto=update
-- will create tables from JPA entities, but this script can be used
-- for manual setup or migration tooling (Flyway / Liquibase).
-- =============================================================

-- 1. Users table — stores both ADMIN and CUSTOMER accounts
CREATE TABLE IF NOT EXISTS users (
    id              BIGSERIAL       PRIMARY KEY,
    first_name      VARCHAR(100)    NOT NULL,
    last_name       VARCHAR(100)    NOT NULL,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password        VARCHAR(255)    NOT NULL,
    role            VARCHAR(20)     NOT NULL DEFAULT 'CUSTOMER'
                        CHECK (role IN ('ADMIN', 'CUSTOMER')),
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories table — hierarchical product categories
CREATE TABLE IF NOT EXISTS categories (
    id              BIGSERIAL       PRIMARY KEY,
    name            VARCHAR(150)    NOT NULL UNIQUE,
    description     TEXT,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Products table — each product belongs to a category
CREATE TABLE IF NOT EXISTS products (
    id              BIGSERIAL       PRIMARY KEY,
    name            VARCHAR(255)    NOT NULL,
    description     TEXT,
    price           DECIMAL(12, 2)  NOT NULL CHECK (price >= 0),
    stock_quantity  INTEGER         NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    image_url       VARCHAR(500),
    category_id     BIGINT          NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Orders table — customer orders
CREATE TABLE IF NOT EXISTS orders (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status          VARCHAR(30)     NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    total_amount    DECIMAL(14, 2)  NOT NULL DEFAULT 0,
    shipping_address TEXT,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Order Items — join table between orders and products
CREATE TABLE IF NOT EXISTS order_items (
    id              BIGSERIAL       PRIMARY KEY,
    order_id        BIGINT          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      BIGINT          NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity        INTEGER         NOT NULL CHECK (quantity > 0),
    unit_price      DECIMAL(12, 2)  NOT NULL CHECK (unit_price >= 0)
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user      ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
