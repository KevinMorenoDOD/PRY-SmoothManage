-- Hibernate ddl-auto had narrowed these free-form text columns to varchar(255),
-- which truncated/capped note content and task descriptions. Restore them to TEXT
-- so their length is no longer limited to 255 characters.
ALTER TABLE note_nodes ALTER COLUMN content TYPE TEXT;
ALTER TABLE task_nodes ALTER COLUMN description TYPE TEXT;
