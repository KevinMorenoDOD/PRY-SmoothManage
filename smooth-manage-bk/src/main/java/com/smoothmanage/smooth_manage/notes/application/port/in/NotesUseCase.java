package com.smoothmanage.smooth_manage.notes.application.port.in;

import com.smoothmanage.smooth_manage.notes.application.dto.CreateFolderRequest;
import com.smoothmanage.smooth_manage.notes.application.dto.CreateNoteRequest;
import com.smoothmanage.smooth_manage.notes.application.dto.DeleteNotesRequest;
import com.smoothmanage.smooth_manage.notes.application.dto.EditNotesRequests;
import com.smoothmanage.smooth_manage.notes.application.dto.NotesResponse;

import java.util.List;

public interface NotesUseCase {
    NotesResponse createFolder(Long userId, CreateFolderRequest request);
    NotesResponse createNote(Long userId, CreateNoteRequest request);
    NotesResponse update(Long userId, EditNotesRequests request);
    void delete(Long userId, DeleteNotesRequest request);
    NotesResponse getById(Long userId, Long id);
    List<NotesResponse> getAllByUserId(Long userId);
    List<NotesResponse> getByParentId(Long userId, Long parentId);
}
