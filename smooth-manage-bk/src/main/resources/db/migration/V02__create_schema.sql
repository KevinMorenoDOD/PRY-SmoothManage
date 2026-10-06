-- V02: Schema

-- Timestamps are timestamptz. Business tables filter by user_id (row-level multi-tenancy).

-- ---------------------------------------------------------------------------
-- todo (Auth) module
-- ---------------------------------------------------------------------------

--Users table
CREATE TABLE IF NOT EXISTS users (
        id            BIGSERIAL PRIMARY KEY,
        email         VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        display_name  VARCHAR(255) NOT NULL,
        email_verified BOOLEAN     NOT NULL DEFAULT FALSE,
        created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
        updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Active refresh token per user (rotation, single row — overwritten on refresh).
CREATE TABLE IF NOT EXISTS refresh_tokens (
        id         BIGSERIAL PRIMARY KEY,
        user_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

--principal init token once login
CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id         BIGSERIAL PRIMARY KEY,
        user_id    BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMPTZ  NOT NULL,
        created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

--Token for the pasword reset to expire chan pasword sessions
CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id         BIGSERIAL PRIMARY KEY,
        user_id    BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMPTZ  NOT NULL,
        used_at    TIMESTAMPTZ,
        created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);


-- Created as nodes beacause they are gona have type of node where they change its behavior
-- ---------------------------------------------------------------------------
-- todo (tasks) module
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS task_nodes (
        id          BIGSERIAL PRIMARY KEY,
        user_id     BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type        tasks_node_type NOT NULL,
        parent_id   BIGINT      REFERENCES task_nodes(id) ON DELETE CASCADE,
        title       VARCHAR(255) NOT NULL,
        description TEXT,
        priority    tasks_priority     NOT NULL DEFAULT 'MEDIUM',
        due_date    TIMESTAMPTZ,
        status      tasks_status  NOT NULL DEFAULT 'TODO',
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
        deleted_at  TIMESTAMPTZ
);

-- ---------------------------------------------------------------------------
-- todo (notes) module
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS note_nodes (
        id         BIGSERIAL PRIMARY KEY,
        user_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type       notes_node_type NOT NULL,
        parent_id  BIGINT      REFERENCES note_nodes(id) ON DELETE CASCADE,
        title      VARCHAR(255) NOT NULL,
        content    TEXT,
        sort_order INT         NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at TIMESTAMPTZ
);

