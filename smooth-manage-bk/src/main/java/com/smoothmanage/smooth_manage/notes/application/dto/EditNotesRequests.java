package com.smoothmanage.smooth_manage.notes.application.dto;

public record EditNotesRequests(
        Long id,
        Long parentId,
        String title,
        String content,
        Integer sortOrder
) {}
