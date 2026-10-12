package com.smoothmanage.smooth_manage.notes.interfaces;

import com.smoothmanage.smooth_manage.notes.application.dto.CreateFolderRequest;
import com.smoothmanage.smooth_manage.notes.application.dto.CreateNoteRequest;
import com.smoothmanage.smooth_manage.notes.application.dto.DeleteNotesRequest;
import com.smoothmanage.smooth_manage.notes.application.dto.EditNotesRequests;
import com.smoothmanage.smooth_manage.notes.application.dto.NotesResponse;
import com.smoothmanage.smooth_manage.notes.application.port.in.NotesUseCase;
import com.smoothmanage.smooth_manage.shared.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notes")
public class NotesController {

    private final NotesUseCase notesUseCase;
    private final CurrentUser currentUser;

    public NotesController(NotesUseCase notesUseCase, CurrentUser currentUser) {
        this.notesUseCase = notesUseCase;
        this.currentUser = currentUser;
    }

    @PostMapping("/folders")
    @ResponseStatus(HttpStatus.CREATED)
    public NotesResponse createFolder(@Valid @RequestBody CreateFolderRequest request) {
        return notesUseCase.createFolder(userId(), request);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NotesResponse createNote(@Valid @RequestBody CreateNoteRequest request) {
        return notesUseCase.createNote(userId(), request);
    }

    @PutMapping("/{id}")
    public NotesResponse update(@PathVariable Long id, @Valid @RequestBody EditNotesRequests request) {
        return notesUseCase.update(userId(), new EditNotesRequests(
                id,
                request.parentId(),
                request.title(),
                request.content(),
                request.sortOrder()
        ));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        notesUseCase.delete(userId(), new DeleteNotesRequest(id));
    }

    @GetMapping("/{id}")
    public NotesResponse getById(@PathVariable Long id) {
        return notesUseCase.getById(userId(), id);
    }

    @GetMapping
    public List<NotesResponse> getAll() {
        return notesUseCase.getAllByUserId(userId());
    }

    @GetMapping("/parent/{parentId}")
    public List<NotesResponse> getByParentId(@PathVariable Long parentId) {
        return notesUseCase.getByParentId(userId(), parentId);
    }

    @GetMapping("/root")
    public List<NotesResponse> getRootNotes() {
        return notesUseCase.getByParentId(userId(), null);
    }

    private Long userId() {
        return currentUser.getUserId()
                .orElseThrow(() -> new IllegalArgumentException("Not authenticated"));
    }
}
