package com.smoothmanage.smooth_manage.notes.application.dto;

import jakarta.validation.constraints.Size;

public record EditNotesRequests(
        Long id,
        Long parentId,
        @Size(max = 255) String title,
        String content,
        Integer sortOrder
) {}
