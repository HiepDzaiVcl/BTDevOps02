package com.coffeeshop.dto;

import com.coffeeshop.entity.TableStatus;

public record TableRequest(
        String tableName,
        int capacity,
        TableStatus status
) {}