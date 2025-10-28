package com.coffeeshop.repository;

import com.coffeeshop.entity.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @EntityGraph(attributePaths = {
            "user",
            "items",
            "items.product",
            "table",
            "table.reservations",
            "table.reservations.user"
    })
    List<Order> findByUserId(Long userId);
}