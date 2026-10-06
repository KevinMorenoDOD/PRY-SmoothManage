package com.smoothmanage.smooth_manage.auth.application.port.out;

import com.smoothmanage.smooth_manage.auth.domain.model.RefreshToken;

import java.util.Optional;

public interface RefreshTokenRepository {
    RefreshToken save(RefreshToken token);
    Optional<RefreshToken> findByUserId(Long userId);
    Optional<RefreshToken> findByTokenHash(String tokenHash);
    void delete(RefreshToken token);
}