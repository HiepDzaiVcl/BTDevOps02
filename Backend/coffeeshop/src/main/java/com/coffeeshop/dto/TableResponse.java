package com.coffeeshop.dto;

import java.util.List;

public record TableResponse(
        Long id,
        String tableName,
        int capacity,
        String status,
        List<ReservationResponse> reservations
) {
    public record ReservationResponse(
            Long id,
            UserResponse user,
            int numPeople,
            String reservationTime,
            String status
    ) {}

    public record UserResponse(Long id, String email) {}
}