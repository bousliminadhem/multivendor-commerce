package com.ecommerce.platform.entity;

/**
 * Enum representing the possible roles for a platform user.
 * <p>
 * ADMIN    – Full access to manage products, categories, orders, and users.
 * CUSTOMER – Can browse products, place orders, and manage own profile.
 */
public enum Role {
    ADMIN,
    CUSTOMER
}
