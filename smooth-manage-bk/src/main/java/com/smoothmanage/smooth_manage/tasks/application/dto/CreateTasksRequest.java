package com.smoothmanage.smooth_manage.tasks.application.dto;

import com.smoothmanage.smooth_manage.tasks.domain.model.TasksNodeType;
import com.smoothmanage.smooth_manage.tasks.domain.model.TasksPriority;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record CreateTasksRequest(
        Long parentId,
        @NotNull TasksNodeType type,
        @NotNull @Size(min = 1, max = 255) String title,
        String description,
        TasksPriority priority,
        Instant dueDate
) {
    public CreateTasksRequest {
        if (priority == null) {
            priority = TasksPriority.MEDIUM;
        }
    }
}
