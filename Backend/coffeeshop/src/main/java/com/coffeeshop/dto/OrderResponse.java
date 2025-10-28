package com.coffeeshop.dto;

import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        UserResponse user,
        TableResponse table,
        LocalDateTime orderTime,
        double totalAmount,
        String status,
        List<OrderItemResponse> items
) {
    public record UserResponse(Long id, String email) {}

    public record TableResponse(
            Long id,
            String tableName,
            int capacity,
            String status,
            List<ReservationResponse> reservations
    ) {}

    public record ReservationResponse(
            Long id,
            UserResponse user,
            int numPeople,
            LocalDateTime reservationTime,
            String status
    ) {}

    public record OrderItemResponse(
            Long id,
            ProductResponse product,
            int quantity,
            double price
    ) {}

    public record ProductResponse(Long id, String name, double price, String imageUrl ) {}
}