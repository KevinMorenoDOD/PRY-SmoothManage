package com.smoothmanage.smooth_manage.auth.infrastructure.persistence;

import com.smoothmanage.smooth_manage.auth.application.port.out.RefreshTokenRepository;
import com.smoothmanage.smooth_manage.auth.domain.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenRepositoryJpaAdapter extends RefreshTokenRepository, JpaRepository<RefreshToken, Long> {
}