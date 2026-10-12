package com.smoothmanage.smooth_manage.notes.application.port.out;

import com.smoothmanage.smooth_manage.notes.domain.model.Notes;

import java.util.List;
import java.util.Optional;

public interface NotesRepository {
    Notes save(Notes note);

    List<Notes> findAllByUserId(Long userId);
    Optional<Notes> findByIdAndUserId(Long id, Long userId);
    void deleteByIdAndUserId(Long id, Long userId);
    List<Notes> findAllByParentIdAndUserId(Long userId, Long parentId);
}
