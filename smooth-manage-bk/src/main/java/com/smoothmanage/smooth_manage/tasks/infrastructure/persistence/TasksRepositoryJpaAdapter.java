package com.smoothmanage.smooth_manage.tasks.infrastructure.persistence;

import com.smoothmanage.smooth_manage.tasks.application.port.out.TasksRepository;
import com.smoothmanage.smooth_manage.tasks.domain.model.Tasks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TasksRepositoryJpaAdapter extends TasksRepository, JpaRepository<Tasks, Long> {

    @Override
    @Query("SELECT t FROM Tasks t WHERE t.userId = :userId AND t.deletedAt IS NULL")
    List<Tasks> findAllByUserId(@Param("userId") Long userId);

    @Override
    @Query("SELECT t FROM Tasks t WHERE t.id = :id AND t.userId = :userId AND t.deletedAt IS NULL")
    Optional<Tasks> findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    @Override
    @Query("SELECT t FROM Tasks t WHERE t.id = :id AND t.deletedAt IS NULL")
    Optional<Tasks> findById(@Param("id") Long id);

    @Override
    @Query("SELECT t FROM Tasks t WHERE t.userId = :userId AND t.parentId = :parentId AND t.deletedAt IS NULL")
    List<Tasks> findAllByParentIdAndUserId(@Param("userId") Long userId, @Param("parentId") Long parentId);

    @Override
    @Query("SELECT t FROM Tasks t WHERE t.title = :title AND t.deletedAt IS NULL")
    Optional<Tasks> findByTitle(@Param("title") String title);

    @Override
    void deleteByIdAndUserId(Long id, Long userId);
}