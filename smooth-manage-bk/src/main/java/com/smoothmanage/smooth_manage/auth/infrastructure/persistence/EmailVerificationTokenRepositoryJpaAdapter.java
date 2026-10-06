package com.smoothmanage.smooth_manage.auth.infrastructure.persistence;

import com.smoothmanage.smooth_manage.auth.application.port.out.EmailVerificationTokenRepository;
import com.smoothmanage.smooth_manage.auth.domain.model.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailVerificationTokenRepositoryJpaAdapter extends EmailVerificationTokenRepository, JpaRepository<EmailVerificationToken, Long> {
}