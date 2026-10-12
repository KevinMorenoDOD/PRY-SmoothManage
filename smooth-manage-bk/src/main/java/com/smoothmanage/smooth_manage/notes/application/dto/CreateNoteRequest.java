package com.smoothmanage.smooth_manage.notes.application.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateNoteRequest(
        Long parentId,
        @NotNull @Size(min = 1, max = 255) String title,
        Integer sortOrder
) {
    public CreateNoteRequest {
        if (sortOrder == null) {
            sortOrder = 0;
        }
    }
}