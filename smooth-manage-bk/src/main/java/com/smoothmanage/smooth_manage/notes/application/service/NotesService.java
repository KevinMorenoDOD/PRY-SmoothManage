package com.smoothmanage.smooth_manage.notes.application.service;

import com.smoothmanage.smooth_manage.notes.application.dto.CreateFolderRequest;
import com.smoothmanage.smooth_manage.notes.application.dto.CreateNoteRequest;
import com.smoothmanage.smooth_manage.notes.application.dto.DeleteNotesRequest;
import com.smoothmanage.smooth_manage.notes.application.dto.EditNotesRequests;
import com.smoothmanage.smooth_manage.notes.application.dto.NotesResponse;
import com.smoothmanage.smooth_manage.notes.application.port.in.NotesUseCase;
import com.smoothmanage.smooth_manage.notes.application.port.out.NotesRepository;
import com.smoothmanage.smooth_manage.notes.domain.model.Notes;
import com.smoothmanage.smooth_manage.notes.domain.model.NotesNodeType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Deque;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class NotesService implements NotesUseCase {

    private final NotesRepository notesRepository;

    public NotesService(NotesRepository notesRepository) {
        this.notesRepository = notesRepository;
    }

    @Transactional
    @Override
    public NotesResponse createFolder(Long userId, CreateFolderRequest request) {
        Notes folder = new Notes(
                userId,
                NotesNodeType.FOLDER,
                request.parentId(),
                request.title(),
                null,
                request.sortOrder()
        );
        Notes saved = notesRepository.save(folder);
        return NotesResponse.from(saved);
    }

    @Transactional
    @Override
    public NotesResponse createNote(Long userId, CreateNoteRequest request) {
        Notes note = new Notes(
                userId,
                NotesNodeType.NOTE,
                request.parentId(),
                request.title(),
                null,
                request.sortOrder()
        );
        Notes saved = notesRepository.save(note);
        return NotesResponse.from(saved);
    }

    @Transactional
    @Override
    public NotesResponse update(Long userId, EditNotesRequests request) {
        Notes note = notesRepository.findByIdAndUserId(request.id(), userId)
                .orElseThrow(() -> new IllegalArgumentException("Note not found with id: " + request.id()));

        if (request.parentId() != null) {
            note.setParentId(request.parentId() == -1L ? null : request.parentId());
        }
        if (request.title() != null) {
            note.setTitle(request.title());
        }
        if (request.sortOrder() != null) {
            note.setSortOrder(request.sortOrder());
        }
        if (request.content() != null && note.getType() == NotesNodeType.NOTE) {
            note.setContent(request.content());
        }
        note.setUpdatedAt(Instant.now());

        Notes saved = notesRepository.save(note);
        return NotesResponse.from(saved);
    }

    @Transactional
    @Override
    public void delete(Long userId, DeleteNotesRequest request) {
        Notes note = notesRepository.findByIdAndUserId(request.id(), userId)
                .orElseThrow(() -> new IllegalArgumentException("Note not found with id: " + request.id()));

        List<Long> subtree = new ArrayList<>(subtreeOf(userId, note.getId()));
        Collections.reverse(subtree);
        subtree.forEach(id -> notesRepository.deleteByIdAndUserId(id, userId));
    }

    private Set<Long> subtreeOf(Long userId, Long rootId) {
        List<Notes> all = notesRepository.findAllByUserId(userId);
        Map<Long, List<Long>> childrenByParent = all.stream()
                .collect(Collectors.groupingBy(
                        n -> n.getParentId() == null ? 0L : n.getParentId(),
                        Collectors.mapping(Notes::getId, Collectors.toList())
                ));

        Set<Long> subtree = new LinkedHashSet<>();
        Deque<Long> pending = new ArrayDeque<>();
        pending.add(rootId);
        while (!pending.isEmpty()) {
            Long current = pending.poll();
            if (subtree.add(current)) {
                pending.addAll(childrenByParent.getOrDefault(current, List.of()));
            }
        }
        return subtree;
    }

    @Transactional(readOnly = true)
    @Override
    public NotesResponse getById(Long userId, Long id) {
        Notes note = notesRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Note not found with id: " + id));
        return NotesResponse.from(note);
    }

    @Transactional(readOnly = true)
    @Override
    public List<NotesResponse> getAllByUserId(Long userId) {
        return notesRepository.findAllByUserId(userId)
                .stream()
                .map(NotesResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public List<NotesResponse> getByParentId(Long userId, Long parentId) {
        return notesRepository.findAllByParentIdAndUserId(userId, parentId)
                .stream()
                .map(NotesResponse::from)
                .toList();
    }
}
