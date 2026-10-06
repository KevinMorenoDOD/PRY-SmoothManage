package com.smoothmanage.smooth_manage.auth.application.service;

import com.smoothmanage.smooth_manage.auth.application.dto.AuthResponse;
import com.smoothmanage.smooth_manage.auth.application.dto.ChangePasswordRequest;
import com.smoothmanage.smooth_manage.auth.application.dto.ForgotPasswordRequest;
import com.smoothmanage.smooth_manage.auth.application.dto.LoginRequest;
import com.smoothmanage.smooth_manage.auth.application.dto.RegisterRequest;
import com.smoothmanage.smooth_manage.auth.application.dto.ResetPasswordRequest;
import com.smoothmanage.smooth_manage.auth.application.dto.UserResponse;
import com.smoothmanage.smooth_manage.auth.application.dto.VerifyEmailRequest;
import com.smoothmanage.smooth_manage.auth.application.port.in.AuthUseCase;
import com.smoothmanage.smooth_manage.auth.application.port.out.EmailVerificationTokenRepository;
import com.smoothmanage.smooth_manage.auth.application.port.out.PasswordResetTokenRepository;
import com.smoothmanage.smooth_manage.auth.application.port.out.RefreshTokenRepository;
import com.smoothmanage.smooth_manage.auth.application.port.out.UserRepository;
import com.smoothmanage.smooth_manage.auth.domain.model.EmailVerificationToken;
import com.smoothmanage.smooth_manage.auth.domain.model.PasswordResetToken;
import com.smoothmanage.smooth_manage.auth.domain.model.RefreshToken;
import com.smoothmanage.smooth_manage.auth.domain.model.User;
import com.smoothmanage.smooth_manage.shared.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class AuthService implements AuthUseCase {

    private static final int EMAIL_VERIFICATION_TTL_HOURS = 24;
    private static final int PASSWORD_RESET_TTL_HOURS = 1;

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenService tokenService;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       EmailVerificationTokenRepository emailVerificationTokenRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       TokenService tokenService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tokenService = tokenService;
    }

    @Transactional
    @Override
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered: " + email);
        }

        User user = new User(email, passwordEncoder.encode(request.password()), request.displayName());
        userRepository.save(user);

        createEmailVerificationToken(user);
        return issueTokens(user);
    }

    @Transactional
    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(normalizeEmail(request.email()))
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        return issueTokens(user);
    }

    @Transactional
    @Override
    public AuthResponse refresh(String rawRefreshToken) {
        RefreshToken stored = refreshTokenRepository.findByTokenHash(tokenService.hash(rawRefreshToken))
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (stored.isExpired()) {
            refreshTokenRepository.delete(stored);
            throw new IllegalArgumentException("Refresh token expired");
        }

        User user = userRepository.findById(stored.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User no longer exists"));

        refreshTokenRepository.delete(stored);
        return issueTokens(user);
    }

    @Transactional
    @Override
    public void logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        refreshTokenRepository.findByUserId(user.getId())
                .ifPresent(refreshTokenRepository::delete);
    }

    @Transactional
    @Override
    public void verifyEmail(VerifyEmailRequest request) {
        EmailVerificationToken stored = emailVerificationTokenRepository
                .findByTokenHash(tokenService.hash(request.token()))
                .orElseThrow(() -> new IllegalArgumentException("Invalid verification token"));

        if (stored.isExpired()) {
            emailVerificationTokenRepository.delete(stored);
            throw new IllegalArgumentException("Verification token expired");
        }

        User user = userRepository.findById(stored.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setEmailVerified(true);
        emailVerificationTokenRepository.delete(stored);
    }

    @Transactional
    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(normalizeEmail(request.email())).orElse(null);
        if (user == null) {
            return;
        }

        String rawToken = tokenService.generateOpaqueToken();
        PasswordResetToken resetToken = new PasswordResetToken(
                user.getId(),
                tokenService.hash(rawToken),
                Instant.now().plus(PASSWORD_RESET_TTL_HOURS, ChronoUnit.HOURS)
        );
        passwordResetTokenRepository.save(resetToken);
    }

    @Transactional
    @Override
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken stored = passwordResetTokenRepository
                .findByTokenHash(tokenService.hash(request.token()))
                .orElseThrow(() -> new IllegalArgumentException("Invalid reset token"));

        if (stored.isUsed() || stored.isExpired()) {
            passwordResetTokenRepository.delete(stored);
            throw new IllegalArgumentException("Reset token expired or already used");
        }

        User user = userRepository.findById(stored.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        stored.markUsed();
        refreshTokenRepository.findByUserId(user.getId()).ifPresent(refreshTokenRepository::delete);
    }

    @Transactional
    @Override
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
    }

    @Transactional(readOnly = true)
    @Override
    public UserResponse me(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return UserResponse.from(user);
    }

    private void createEmailVerificationToken(User user) {
        String rawToken = tokenService.generateOpaqueToken();
        EmailVerificationToken verificationToken = new EmailVerificationToken(
                user.getId(),
                tokenService.hash(rawToken),
                Instant.now().plus(EMAIL_VERIFICATION_TTL_HOURS, ChronoUnit.HOURS)
        );
        emailVerificationTokenRepository.save(verificationToken);
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        refreshTokenRepository.findByUserId(user.getId()).ifPresent(refreshTokenRepository::delete);
        refreshTokenRepository.save(new RefreshToken(
                user.getId(),
                tokenService.hash(refreshToken),
                jwtService.extractExpiration(refreshToken).toInstant()
        ));

        return new AuthResponse(accessToken, refreshToken, "Bearer", UserResponse.from(user));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}