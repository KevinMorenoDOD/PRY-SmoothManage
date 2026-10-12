package com.smoothmanage.smooth_manage.notes.application.dto;

import com.smoothmanage.smooth_manage.notes.domain.model.Notes;
import com.smoothmanage.smooth_manage.notes.domain.model.NotesNodeType;

import java.time.Instant;

public record NotesResponse(
        Long id,
        Long parentId,
        NotesNodeType type,
        String title,
        String content,
        Integer sortOrder,
        Instant createdAt,
        Instant updatedAt
) {
    public static NotesResponse from(Notes note) {
        return new NotesResponse(
                note.getId(),
                note.getParentId(),
                note.getType(),
                note.getTitle(),
                note.getContent(),
                note.getSortOrder(),
                note.getCreatedAt(),
                note.getUpdatedAt()
        );
    }
}
