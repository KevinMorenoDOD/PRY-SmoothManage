package com.smoothmanage.smooth_manage.auth.application.port.in;

import com.smoothmanage.smooth_manage.auth.application.dto.AuthResponse;
import com.smoothmanage.smooth_manage.auth.application.dto.ChangePasswordRequest;
import com.smoothmanage.smooth_manage.auth.application.dto.ForgotPasswordRequest;
import com.smoothmanage.smooth_manage.auth.application.dto.LoginRequest;
import com.smoothmanage.smooth_manage.auth.application.dto.RegisterRequest;
import com.smoothmanage.smooth_manage.auth.application.dto.ResetPasswordRequest;
import com.smoothmanage.smooth_manage.auth.application.dto.UserResponse;
import com.smoothmanage.smooth_manage.auth.application.dto.VerifyEmailRequest;

public interface AuthUseCase {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(String rawRefreshToken);

    void logout(String email);

    void verifyEmail(VerifyEmailRequest request);

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);

    void changePassword(String email, ChangePasswordRequest request);

    UserResponse me(String email);
}