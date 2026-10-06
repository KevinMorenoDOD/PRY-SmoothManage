package com.smoothmanage.smooth_manage.auth.application.port.out;

import com.smoothmanage.smooth_manage.auth.domain.model.PasswordResetToken;

import java.util.Optional;

public interface PasswordResetTokenRepository {
    PasswordResetToken save(PasswordResetToken token);
    Optional<PasswordResetToken> findByTokenHash(String tokenHash);
    void delete(PasswordResetToken token);
}