package com.smoothmanage.smooth_manage.notes.domain.model;

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
@Table(name = "note_nodes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Notes extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "type", nullable = false)
    private NotesNodeType type;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "content", columnDefinition = "text")
    private String content;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Column(name = "deleted_at")
    private Instant deletedAt;

    public Notes(Long userId, NotesNodeType type, Long parentId, String title, String content, Integer sortOrder) {
        this.userId = userId;
        this.type = type;
        this.parentId = parentId;
        this.title = title;
        this.content = type == NotesNodeType.FOLDER ? null : content;
        this.sortOrder = sortOrder;
    }
}
