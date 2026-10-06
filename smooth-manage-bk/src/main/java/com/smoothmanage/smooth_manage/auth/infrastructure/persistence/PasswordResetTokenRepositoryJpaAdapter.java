package com.smoothmanage.smooth_manage.auth.infrastructure.persistence;

import com.smoothmanage.smooth_manage.auth.application.port.out.PasswordResetTokenRepository;
import com.smoothmanage.smooth_manage.auth.domain.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetTokenRepositoryJpaAdapter extends PasswordResetTokenRepository, JpaRepository<PasswordResetToken, Long> {
}