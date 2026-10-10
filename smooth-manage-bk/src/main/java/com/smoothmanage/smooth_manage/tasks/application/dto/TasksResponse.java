package com.smoothmanage.smooth_manage.tasks.application.dto;

import com.smoothmanage.smooth_manage.tasks.application.port.in.TasksUseCase;
import com.smoothmanage.smooth_manage.tasks.domain.model.Tasks;
import com.smoothmanage.smooth_manage.tasks.domain.model.TasksPriority;
import com.smoothmanage.smooth_manage.tasks.domain.model.TasksStatus;

import java.time.Instant;

public record TasksResponse(
        Long id,
        Long parentId,
        String title,
        String description,
        TasksPriority priority,
        Instant dueDate,
        TasksStatus tasksStatus
) {
    public static TasksResponse from (Tasks tasks) {
        return new TasksResponse(
                tasks.getId(),
                tasks.getParentId(),
                tasks.getTitle(),
                tasks.getDescription(),
                tasks.getPriority(),
                tasks.getDueDate(),
                tasks.getStatus()
        );
    }
}
