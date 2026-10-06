package com.smoothmanage.smooth_manage.auth.domain.model;

import com.smoothmanage.smooth_manage.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "password_reset_tokens")
@Getter
@NoArgsConstructor
public class PasswordResetToken extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "token_hash", nullable = false, length = 255)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "used_at")
    private Instant usedAt;

    //constructor that is gonna be used
    public PasswordResetToken(Long userId, String tokenHash, Instant expiresAt) {
        this.userId = userId;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
    }

    //the expired verification
    public boolean isExpired() {
        return expiresAt.isBefore(Instant.now());
    }

    //the isUsed verification
    public boolean isUsed() {
        return usedAt != null;
    }

    //the change state used function
    public void markUsed() {
        this.usedAt = Instant.now();
    }
}
