package com.smoothmanage.smooth_manage.tasks.application.port.out;
import com.smoothmanage.smooth_manage.tasks.domain.model.Tasks;

import java.util.List;
import java.util.Optional;

public interface TasksRepository {
    Tasks save(Tasks task);

    List<Tasks> findAllByUserId(Long userId);
    Optional<Tasks> findByIdAndUserId(Long id, Long userId);
    void deleteByIdAndUserId(Long id, Long userId);
    List<Tasks> findAllByParentIdAndUserId(Long userId, Long parentId);

    Optional<Tasks> findById(Long id);
    Optional<Tasks> findByTitle(String title);
}
