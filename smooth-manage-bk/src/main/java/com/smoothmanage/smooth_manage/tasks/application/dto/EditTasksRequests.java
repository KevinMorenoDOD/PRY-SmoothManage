package com.smoothmanage.smooth_manage.tasks.application.dto;

import com.smoothmanage.smooth_manage.tasks.domain.model.TasksPriority;
import com.smoothmanage.smooth_manage.tasks.domain.model.TasksStatus;

import java.time.Instant;

public record EditTasksRequests(
        Long id,
        Long parentId,
        String title,
        String description,
        TasksPriority priority,
        Instant dueDate,
        TasksStatus status
) {}
