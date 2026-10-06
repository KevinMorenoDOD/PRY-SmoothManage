package com.smoothmanage.smooth_manage.auth.application.dto;

public record UserResponse(Long id, String email, String displayName, boolean emailVerified) {
    public static UserResponse from(com.smoothmanage.smooth_manage.auth.domain.model.User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getDisplayName(), user.isEmailVerified());
    }
}