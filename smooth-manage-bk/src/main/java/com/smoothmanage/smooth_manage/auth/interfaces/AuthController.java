package com.smoothmanage.smooth_manage.auth.interfaces;

import com.smoothmanage.smooth_manage.auth.application.port.in.AuthUseCase;
import com.smoothmanage.smooth_manage.auth.application.dto.AuthResponse;
import com.smoothmanage.smooth_manage.auth.application.dto.ChangePasswordRequest;
import com.smoothmanage.smooth_manage.auth.application.dto.ForgotPasswordRequest;
import com.smoothmanage.smooth_manage.auth.application.dto.LoginRequest;
import com.smoothmanage.smooth_manage.auth.application.dto.RefreshTokenRequest;
import com.smoothmanage.smooth_manage.auth.application.dto.RegisterRequest;
import com.smoothmanage.smooth_manage.auth.application.dto.ResetPasswordRequest;
import com.smoothmanage.smooth_manage.auth.application.dto.UserResponse;
import com.smoothmanage.smooth_manage.auth.application.dto.VerifyEmailRequest;
import com.smoothmanage.smooth_manage.shared.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthUseCase authUseCase;
    private final CurrentUser currentUser;

    public AuthController(AuthUseCase authUseCase, CurrentUser currentUser) {
        this.authUseCase = authUseCase;
        this.currentUser = currentUser;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authUseCase.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authUseCase.login(request);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return authUseCase.refresh(request.refreshToken());
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout() {
        currentUser.getEmail().ifPresent(authUseCase::logout);
    }

    @PostMapping("/verify-email")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authUseCase.verifyEmail(request);
    }

    @PostMapping("/forgot-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authUseCase.forgotPassword(request);
    }

    @PostMapping("/reset-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authUseCase.resetPassword(request);
    }

    @PostMapping("/change-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        currentUser.getEmail()
                .map(email -> {
                    authUseCase.changePassword(email, request);
                    return null;
                })
                .orElseThrow(() -> new IllegalArgumentException("Not authenticated"));
    }

    @GetMapping("/me")
    public UserResponse me() {
        Optional<String> email = currentUser.getEmail();
        return email.map(authUseCase::me)
                .orElseThrow(() -> new IllegalArgumentException("Not authenticated"));
    }
}