package com.smoothmanage.smooth_manage.auth.application.dto;

import jakarta.validation.constraints.NotBlank;

public record AuthResponse(String accessToken, String refreshToken, String tokenType, UserResponse user) {
    public AuthResponse(String accessToken, String refreshToken, UserResponse user) {
        this(accessToken, refreshToken, "Bearer", user);
    }
}