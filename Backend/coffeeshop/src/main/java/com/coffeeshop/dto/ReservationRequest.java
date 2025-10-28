package com.coffeeshop.dto;

import java.time.LocalDateTime;

public record ReservationRequest(Long userId, Long tableId, int numPeople, LocalDateTime reservationTime, String content) {}