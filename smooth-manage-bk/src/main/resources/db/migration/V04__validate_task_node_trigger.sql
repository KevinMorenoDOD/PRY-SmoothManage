CREATE OR REPLACE FUNCTION validate_task_node()
    RETURNS TRIGGER AS $$
DECLARE
    parent_type tasks_node_type;
BEGIN
    -- 1) Si hay parent_id: validar que existe en task_nodes, mismo user_id y no borrado
    IF NEW.parent_id IS NOT NULL THEN
        SELECT type INTO parent_type
        FROM task_nodes
        WHERE id = NEW.parent_id
          AND user_id = NEW.user_id
          AND deleted_at IS NULL;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'parent folder % not found or not owned by user', NEW.parent_id;
        END IF;

        IF parent_type <> 'FOLDER' THEN
            RAISE EXCEPTION 'parent node % is not a folder', NEW.parent_id;
        END IF;
    END IF;

    -- 2) LIST no lleva descripción
    IF NEW.type = 'LIST' THEN
        NEW.description := NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_task_node ON task_nodes;

CREATE TRIGGER trg_validate_task_node
    BEFORE INSERT OR UPDATE ON task_nodes
    FOR EACH ROW
EXECUTE FUNCTION validate_task_node();