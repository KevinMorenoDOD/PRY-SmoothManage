package com.smoothmanage.smooth_manage.auth.domain.model;

import com.smoothmanage.smooth_manage.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor
public class User extends BaseEntity {

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Setter
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Setter
    @Column(name = "display_name", nullable = false, length = 255)
    private String displayName;

    @Setter
    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    @Column(nullable = false, updatable = false)
    private Instant updatedAt;

    public User(String email, String passwordHash, String displayName) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.displayName = displayName;
    }

    @PrePersist
    @Override
    protected void onCreate() {
        super.onCreate();
        this.updatedAt = getCreatedAt();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

}
