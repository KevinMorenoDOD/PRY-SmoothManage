package com.smoothmanage.smooth_manage.auth.application.port.out;

import com.smoothmanage.smooth_manage.auth.domain.model.EmailVerificationToken;

import java.util.Optional;

public interface EmailVerificationTokenRepository {
    EmailVerificationToken save(EmailVerificationToken token);
    Optional<EmailVerificationToken> findByTokenHash(String tokenHash);
    void delete(EmailVerificationToken token);
}