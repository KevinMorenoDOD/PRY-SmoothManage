package com.smoothmanage.smooth_manage.tasks.application.service;

import com.smoothmanage.smooth_manage.tasks.application.dto.CreateTasksRequest;
import com.smoothmanage.smooth_manage.tasks.application.dto.DeleteTasksRequest;
import com.smoothmanage.smooth_manage.tasks.application.dto.EditTasksRequests;
import com.smoothmanage.smooth_manage.tasks.application.dto.TasksResponse;
import com.smoothmanage.smooth_manage.tasks.application.port.in.TasksUseCase;
import com.smoothmanage.smooth_manage.tasks.application.port.out.TasksRepository;
import com.smoothmanage.smooth_manage.tasks.domain.model.Tasks;
import com.smoothmanage.smooth_manage.tasks.domain.model.TasksNodeType;
import com.smoothmanage.smooth_manage.tasks.domain.model.TasksPriority;
import com.smoothmanage.smooth_manage.tasks.domain.model.TasksStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class TasksService implements TasksUseCase {

    private final TasksRepository tasksRepository;

    public TasksService(TasksRepository tasksRepository) {
        this.tasksRepository = tasksRepository;
    }

    @Transactional
    @Override
    public TasksResponse create(Long userId, CreateTasksRequest request) {
        Tasks task = new Tasks(
                userId,
                request.type(),
                request.parentId(),
                request.title(),
                request.description(),
                request.priority(),
                request.dueDate(),
                TasksStatus.TODO
        );
        Tasks saved = tasksRepository.save(task);
        return TasksResponse.from(saved);
    }

    @Transactional
    @Override
    public TasksResponse update(Long userId, EditTasksRequests request) {
        Tasks task = tasksRepository.findByIdAndUserId(request.id(), userId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with id: " + request.id()));

        if (request.parentId() != null) {
            task.setParentId(request.parentId());
        }
        if (request.title() != null) {
            task.setTitle(request.title());
        }
        if (request.description() != null) {
            task.setDescription(request.description());
        }
        if (request.priority() != null) {
            task.setPriority(request.priority());
        }
        if (request.dueDate() != null) {
            task.setDueDate(request.dueDate());
        }
        if (request.status() != null) {
            task.setStatus(request.status());
        }
        task.setUpdatedAt(Instant.now());

        Tasks saved = tasksRepository.save(task);
        return TasksResponse.from(saved);
    }

    @Transactional
    @Override
    public void delete(Long userId, DeleteTasksRequest request) {
        tasksRepository.deleteByIdAndUserId(request.id(), userId);
    }

    @Transactional(readOnly = true)
    @Override
    public TasksResponse getById(Long userId, Long id) {
        Tasks task = tasksRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with id: " + id));
        return TasksResponse.from(task);
    }

    @Transactional(readOnly = true)
    @Override
    public List<TasksResponse> getAllByUserId(Long userId) {
        return tasksRepository.findAllByUserId(userId)
                .stream()
                .map(TasksResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public List<TasksResponse> getByParentId(Long userId, Long parentId) {
        return tasksRepository.findAllByParentIdAndUserId(userId, parentId)
                .stream()
                .map(TasksResponse::from)
                .toList();
    }
}