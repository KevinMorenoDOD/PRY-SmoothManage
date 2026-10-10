package com.smoothmanage.smooth_manage.tasks.interfaces;

import com.smoothmanage.smooth_manage.tasks.application.port.in.TasksUseCase;
import com.smoothmanage.smooth_manage.tasks.application.dto.CreateTasksRequest;
import com.smoothmanage.smooth_manage.tasks.application.dto.DeleteTasksRequest;
import com.smoothmanage.smooth_manage.tasks.application.dto.EditTasksRequests;
import com.smoothmanage.smooth_manage.tasks.application.dto.TasksResponse;
import com.smoothmanage.smooth_manage.shared.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tasks")
public class TasksController {

    private final TasksUseCase tasksUseCase;
    private final CurrentUser currentUser;

    public TasksController(TasksUseCase tasksUseCase, CurrentUser currentUser) {
        this.tasksUseCase = tasksUseCase;
        this.currentUser = currentUser;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TasksResponse create(@Valid @RequestBody CreateTasksRequest request) {
        Long userId = currentUser.getUserId()
                .orElseThrow(() -> new IllegalArgumentException("Not authenticated"));
        return tasksUseCase.create(userId, request);
    }

    @PutMapping("/{id}")
    public TasksResponse update(@PathVariable Long id, @Valid @RequestBody EditTasksRequests request) {
        Long userId = currentUser.getUserId()
                .orElseThrow(() -> new IllegalArgumentException("Not authenticated"));
        return tasksUseCase.update(userId, new EditTasksRequests(
                id,
                request.parentId(),
                request.title(),
                request.description(),
                request.priority(),
                request.dueDate(),
                request.status()
        ));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        Long userId = currentUser.getUserId()
                .orElseThrow(() -> new IllegalArgumentException("Not authenticated"));
        tasksUseCase.delete(userId, new DeleteTasksRequest(id));
    }

    @GetMapping("/{id}")
    public TasksResponse getById(@PathVariable Long id) {
        Long userId = currentUser.getUserId()
                .orElseThrow(() -> new IllegalArgumentException("Not authenticated"));
        return tasksUseCase.getById(userId, id);
    }

    @GetMapping
    public List<TasksResponse> getAll() {
        Long userId = currentUser.getUserId()
                .orElseThrow(() -> new IllegalArgumentException("Not authenticated"));
        return tasksUseCase.getAllByUserId(userId);
    }

    @GetMapping("/parent/{parentId}")
    public List<TasksResponse> getByParentId(@PathVariable Long parentId) {
        Long userId = currentUser.getUserId()
                .orElseThrow(() -> new IllegalArgumentException("Not authenticated"));
        return tasksUseCase.getByParentId(userId, parentId);
    }

    @GetMapping("/root")
    public List<TasksResponse> getRootTasks() {
        Long userId = currentUser.getUserId()
                .orElseThrow(() -> new IllegalArgumentException("Not authenticated"));
        return tasksUseCase.getByParentId(userId, null);
    }
}