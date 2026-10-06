package com.smoothmanage.smooth_manage.auth.infrastructure.persistence;

import com.smoothmanage.smooth_manage.auth.application.port.out.UserRepository;
import com.smoothmanage.smooth_manage.auth.domain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepositoryJpaAdapter extends UserRepository, JpaRepository<User, Long> {
}