package com.smoothmanage.smooth_manage.auth.application.dto;

import jakarta.validation.constraints.NotBlank;

public record VerifyEmailRequest(@NotBlank String token) {
}