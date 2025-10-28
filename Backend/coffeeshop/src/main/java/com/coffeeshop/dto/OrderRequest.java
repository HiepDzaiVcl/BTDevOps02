package com.coffeeshop.dto;

import java.util.List;

public record OrderRequest(
        List<OrderItemRequest> items,
        Long tableId,
        Integer numPeople,
        String reservationContent,
        String orderStatus
) {}