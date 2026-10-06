-- V1: Enums: Schema

DO $$
BEGIN
    --Tasks ENUMS
    --Tasks priority to complete
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tasks_priority') THEN
    CREATE TYPE tasks_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');
    END IF;

    --Tasks status info
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tasks_status') THEN
    CREATE TYPE tasks_status AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');
    END IF;

    --Tasks node type to change his behavior
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tasks_node_type') THEN
    CREATE TYPE tasks_node_type AS ENUM ('LIST', 'TASK');
    END IF;



    --Notes ENUMS
    --Notes node type to change his behavior
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notes_node_type') THEN
    CREATE TYPE notes_node_type AS ENUM ('FOLDER', 'NOTE');
    END IF;


END $$;
