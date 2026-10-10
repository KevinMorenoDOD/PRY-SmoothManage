package com.smoothmanage.smooth_manage.tasks.application.port.in;

import com.smoothmanage.smooth_manage.tasks.application.dto.CreateTasksRequest;
import com.smoothmanage.smooth_manage.tasks.application.dto.DeleteTasksRequest;
import com.smoothmanage.smooth_manage.tasks.application.dto.EditTasksRequests;
import com.smoothmanage.smooth_manage.tasks.application.dto.TasksResponse;

import java.util.List;

public interface TasksUseCase {
    TasksResponse create(Long userId, CreateTasksRequest request);
    TasksResponse update(Long userId, EditTasksRequests request);
    void delete(Long userId, DeleteTasksRequest request);
    TasksResponse getById(Long userId, Long id);
    List<TasksResponse> getAllByUserId(Long userId);
    List<TasksResponse> getByParentId(Long userId, Long parentId);
}
