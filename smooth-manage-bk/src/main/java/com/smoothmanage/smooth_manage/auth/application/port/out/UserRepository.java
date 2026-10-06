package com.smoothmanage.smooth_manage.auth.application.port.out;

import com.smoothmanage.smooth_manage.auth.domain.model.User;

import java.util.Optional;

public interface UserRepository {
    User save(User user);
    Optional<User> findById(Long id);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}