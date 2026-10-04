CREATE OR REPLACE FUNCTION validate_note_node()
    RETURNS TRIGGER AS $$
DECLARE
    parent_type notes_node_type;
    is_descendant BOOLEAN;
BEGIN
    -- 1) Si hay parent_id: validar que existe, es FOLDER y mismo user_id
    IF NEW.parent_id IS NOT NULL THEN
        SELECT type INTO parent_type
        FROM note_nodes
        WHERE id = NEW.parent_id
          AND user_id = NEW.user_id
          AND deleted_at IS NULL;  -- solo padres no borrados

        IF NOT FOUND THEN
            RAISE EXCEPTION 'parent folder % not found or not owned by user', NEW.parent_id;
        END IF;

        IF parent_type <> 'FOLDER' THEN
            RAISE EXCEPTION 'parent node % is not a folder', NEW.parent_id;
        END IF;
    END IF;

    -- 2) Prevenir ciclos (solo en UPDATE donde cambia parent_id, o INSERT con parent_id)
    IF NEW.parent_id IS NOT NULL
        AND (TG_OP = 'INSERT' OR OLD.parent_id IS DISTINCT FROM NEW.parent_id) THEN

        WITH RECURSIVE subtree AS (
            SELECT id FROM note_nodes WHERE id = NEW.id AND user_id = NEW.user_id
            UNION ALL
            SELECT n.id FROM note_nodes n
                                 JOIN subtree s ON n.parent_id = s.id
        )
        SELECT EXISTS (SELECT 1 FROM subtree WHERE id = NEW.parent_id)
        INTO is_descendant;

        IF is_descendant THEN
            RAISE EXCEPTION 'cannot move node into its own descendant (cycle detected)';
        END IF;
    END IF;

    -- 3) FOLDER no lleva contenido
    IF NEW.type = 'FOLDER' THEN
        NEW.content := NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_note_node ON note_nodes;

CREATE TRIGGER trg_validate_note_node
    BEFORE INSERT OR UPDATE ON note_nodes
    FOR EACH ROW
EXECUTE FUNCTION validate_note_node();