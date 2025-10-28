package com.coffeeshop.dto;

public record UserResponse(Long id, String name, String email, String phoneNumber, String role) {}