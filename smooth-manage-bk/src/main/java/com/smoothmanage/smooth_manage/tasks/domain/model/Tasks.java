package com.smoothmanage.smooth_manage.tasks.domain.model;

import com.smoothmanage.smooth_manage.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

@Entity
@Table(name = "task_nodes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Tasks extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "type", nullable = false)
    private TasksNodeType type;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "priority", nullable = false)
    private TasksPriority priority = TasksPriority.MEDIUM;

    @Column(name = "due_date")
    private Instant dueDate;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status", nullable = false)
    private TasksStatus status = TasksStatus.TODO;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Column(name = "deleted_at")
    private Instant deletedAt;

    public Tasks(Long userId, TasksNodeType type, Long parentId, String title, String description, TasksPriority priority, Instant dueDate, TasksStatus status) {
        this.userId = userId;
        this.type = type;
        this.parentId = parentId;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.dueDate = dueDate;
        this.status = status;
    }
}
