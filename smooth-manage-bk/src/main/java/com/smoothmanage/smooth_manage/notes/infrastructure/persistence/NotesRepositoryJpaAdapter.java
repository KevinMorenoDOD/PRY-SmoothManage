package com.smoothmanage.smooth_manage.notes.infrastructure.persistence;

import com.smoothmanage.smooth_manage.notes.application.port.out.NotesRepository;
import com.smoothmanage.smooth_manage.notes.domain.model.Notes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NotesRepositoryJpaAdapter extends NotesRepository, JpaRepository<Notes, Long> {

    @Override
    @Query("SELECT n FROM Notes n WHERE n.userId = :userId AND n.deletedAt IS NULL ORDER BY n.sortOrder, n.id")
    List<Notes> findAllByUserId(@Param("userId") Long userId);

    @Override
    @Query("SELECT n FROM Notes n WHERE n.id = :id AND n.userId = :userId AND n.deletedAt IS NULL")
    Optional<Notes> findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    @Override
    @Query("""
            SELECT n FROM Notes n
            WHERE n.userId = :userId
              AND n.deletedAt IS NULL
              AND ((:parentId IS NULL AND n.parentId IS NULL) OR n.parentId = :parentId)
            ORDER BY n.sortOrder, n.id
            """)
    List<Notes> findAllByParentIdAndUserId(@Param("userId") Long userId, @Param("parentId") Long parentId);

    @Override
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Notes n SET n.deletedAt = CURRENT_TIMESTAMP, n.updatedAt = CURRENT_TIMESTAMP WHERE n.id = :id AND n.userId = :userId AND n.deletedAt IS NULL")
    void deleteByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);
}
