# SmoothManage

SmoothManage is a self-hosted personal workspace: a single application that brings together **Markdown notes** organized in folders and **tasks/activities** with priority, due date and status. It is built as a small product that can grow module by module without rewriting what already works.

The repository is a monorepo with a Spring Boot backend, a React SPA, a PostgreSQL database and the project documentation.

**Current status:** the `auth`, `notes` and `tasks` modules are implemented and usable. `projects`, `workflows` and the internal AI are planned.

---

## 1. What the application does

- **Notes:** a tree of folders and notes, Markdown content, search, drag and drop, rename, cascade delete and undo.
- **Tasks:** task lists, tasks with priority and due date, four statuses (`TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`), list and board views, quick add and undo.
- **Accounts:** registration, login with JWT, refresh tokens, logout, email verification, forgot/reset password and change password.
- **Per-user isolation:** every note and task belongs to a user. All queries filter by `user_id`, so nobody can read or modify another user's data.

The long-term vision adds projects, configurable workflows and an internal AI that answers questions using only the authenticated user's content.

---

## 2. Current status

| Module | Status | What is implemented |
|---|---|---|
| `auth` | **Implemented** | Register, login, JWT access + refresh token rotation, logout, email verification, forgot/reset/change password, SMTP email adapter, `GET /me` |
| `notes` | **Implemented** | Folder/note tree, CRUD, Markdown content, ordering, cascade delete, parent validation and cycle prevention |
| `tasks` | **Implemented** | Task lists, task CRUD, priority, due date, statuses, blocked state, parent validation |
| `shared` | **Implemented (base)** | Security (JWT filter, user principal), error handling, base entity, design-system and shared frontend infrastructure |
| `projects` | **Planned** | Project cards, project detail, linking notes and tasks, progress |
| `workflows` | **Planned** | Custom states and transitions, rules, kanban per workflow |
| `ai` | **Planned** | Embeddings, semantic search with pgvector and chat with Spring AI |
| Tests | **Placeholder** | Only the Spring Boot context test exists at the moment |

The navigation in the frontend already reserves a `Projects` entry, but it is disabled until the module exists.

---

## 3. Repository layout

```text
PRY-SmoothManage/
├── smooth-manage-bk/                 # Spring Boot backend (single deployable JAR)
│   ├── pom.xml
│   ├── mvnw / mvnw.cmd
│   └── src/
│       ├── main/java/com/smoothmanage/smooth_manage/
│       │   ├── SmoothManageApplication.java
│       │   ├── auth/                 # accounts, tokens, email
│       │   ├── notes/                # folder/note tree
│       │   ├── tasks/                # task lists and tasks
│       │   └── shared/               # security, errors, common base
│       ├── main/resources/
│       │   ├── application.properties
│       │   └── db/migration/         # Flyway migrations (V01…V07)
│       └── test/java/...             # test sources
│
├── smooth-manage-fnt/                # React + TypeScript SPA
│   ├── src/
│   │   ├── main.tsx                  # composition root
│   │   ├── app/                      # AppRoutes, AppLayout
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── notes/
│   │   │   └── tasks/
│   │   └── shared/                   # design system, layout, infrastructure, lib
│   ├── .env.example
│   └── vite.config.ts
│
├── smooth-manage-db/                 # PostgreSQL 16 for local development
│   └── docker-compose.yml
│
└── smooth-manage-docs/               # documentation and visual prototypes
    ├── README.md                     # this document
    ├── front_style.md                # frontend architecture and visual system
    ├── LoginSketch.html
    ├── NotasSketch.html
    └── TareasSketch.html
```

Each backend module follows the same internal layout:

```text
<module>/
├── domain/
│   └── model/                        # pure entities and business rules
├── application/
│   ├── dto/                          # use-case input/output data
│   ├── port/in/                      # use cases exposed by the module
│   ├── port/out/                     # repositories/gateways the module needs
│   └── service/                      # use-case implementations
├── infrastructure/
│   ├── persistence/                  # JPA adapters
│   ├── email/                        # SMTP adapter (auth)
│   └── security/                     # module-specific security adapters
└── interfaces/                       # REST controllers
```

The frontend uses the same idea, with an extra `public/` entry point for the module contract:

```text
src/modules/<module>/
├── domain/                           # models and business exceptions
├── application/
│   ├── port/in/                      # use cases the UI can invoke
│   ├── port/out/                     # repositories/gateways
│   └── service/                      # use-case implementations
├── infrastructure/
│   ├── api/                          # HTTP adapters
│   └── storage/                      # local-storage adapters
├── interfaces/                       # pages, components, view-models, i18n
└── public/                           # explicit contract for other modules
```

---

## 4. Architecture

### 4.1 Modular monolith

SmoothManage is **one deployable application** (one Spring Boot JAR), organized internally into modules with clear boundaries. Each module owns its domain, rules and internal API. There is no network call between modules.

Rules:

1. A module never imports another module's internal classes.
2. Modules communicate through interfaces or the module's public contract.
3. Each module follows Hexagonal / Clean Architecture internally.
4. There is a single final artifact, regardless of the number of modules.
5. `auth` and `shared` are base modules; business modules must not depend on each other.

```text
┌──────────────────────────────────────────────┐
│              SPRING BOOT (single JAR)        │
│  ┌──────┐  ┌───────┐  ┌───────┐  ┌────────┐  │
│  │ auth │  │ notes │  │ tasks │  │projects│  │
│  └──┬───┘  └───┬───┘  └───┬───┘  └────┬───┘  │
│     └──────────┴──────────┴───────────┘      │
│                  shared                       │
└──────────────────────────────────────────────┘
```

If a module grows too much, it can be extracted into a microservice later: the internal separation already exists.

### 4.2 Backend layers

The dependency direction is always inward:

```text
interfaces ──► application/port/in ──► domain
                     ▲
infrastructure ──► application/port/out
```

- `domain` has no Spring, JPA or HTTP imports.
- `application/service` implements `port/in` and uses `port/out`.
- `infrastructure` implements `port/out` (JPA repositories, SMTP, etc.).
- `interfaces` exposes REST controllers and depends on `port/in`.
- Spring Modulith is part of the stack to keep module boundaries verifiable.

### 4.3 Frontend layers

The frontend follows the same rule. `src/main.tsx` is the **composition root**: the only file that knows all modules and wires adapters to ports. `shared` never imports a business module.

```text
interfaces ──► application/port/in ──► domain
                     ▲
infrastructure ──► application/port/out
```

- Pages and components only use use cases (`port/in`).
- View-models/hooks connect UI state with use cases.
- HTTP adapters implement repositories and map API DTOs to domain objects.
- Local-storage adapters implement the same ports when a backend feature is not available.

### 4.4 Rules for `shared`

`shared` is deliberately small and contains **no business rules**. Something enters `shared` only if:

1. It is used (or clearly will be used) by two or more modules, and
2. It contains no domain logic.

It holds the design system, application layout, base HTTP/storage/router/i18n infrastructure and pure utilities. Business entities and domain-specific components stay in their module.

---

## 5. Modules

### 5.1 `auth`

- Registration with email uniqueness and BCrypt password hashing.
- Login returns an access token and a refresh token.
- Refresh token rotation: one active refresh token per user, stored hashed.
- Logout invalidates the stored refresh token.
- Email verification token (24 h) and password reset token (1 h).
- Password change for the authenticated user.
- `GET /api/v1/auth/me` returns the current profile.
- SMTP email adapter for verification and reset messages.

Registration currently issues tokens immediately; email verification is tracked but does not block login.

### 5.2 `notes`

- Nodes have a type: `FOLDER` or `NOTE`.
- Folders and notes form a tree through `parent_id`.
- Notes have Markdown content; folders cannot have content.
- `sort_order` defines sibling order.
- Deleting a folder deletes its whole subtree.
- Database triggers enforce that a parent is a folder, belongs to the same user, and that a node cannot be moved into its own descendant.
- The schema has `deleted_at`; the current service performs hard cascade deletes rather than soft deletes.

### 5.3 `tasks`

- Nodes have a type: `LIST` or `TASK`.
- A task belongs to a list (`parent_id`), or to the root when it has no parent.
- A list belongs to the root and cannot have a description.
- Tasks have `priority` (`LOW`, `MEDIUM`, `HIGH`), `due_date` and `status` (`TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`).
- A database trigger validates that the parent of a task is a `LIST` owned by the same user.
- The schema has `deleted_at`; the current service performs hard deletes.

### 5.4 Planned modules

- **`projects`:** group notes and tasks, project cards and detail view, progress; consumes `notes` and `tasks` through their public contracts, never through their internals.
- **`workflows`:** user-defined states/transitions and a kanban board with rules.
- **`ai`:** embeddings generated on save, semantic search with pgvector and a chat that only uses the authenticated user's content.

---

## 6. Technology stack

### Backend

| Layer | Technology |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 4.1.1 (Spring MVC) |
| Module boundaries | Spring Modulith 2.1.1 |
| Security | Spring Security + JWT (`jjwt` 0.11.5), BCrypt |
| Persistence | Spring Data JPA + PostgreSQL driver |
| Migrations | Flyway |
| Email | Spring Mail (SMTP) |
| API docs | springdoc-openapi 3.1.0 |
| Build | Maven (wrapper included) |
| Tests | Spring Boot Test (JUnit 5) |

### Frontend

| Layer | Technology |
|---|---|
| Framework | React 18.3 + TypeScript 5.8 |
| Build | Vite 6 |
| Routing | React Router 7 |
| Server state | TanStack Query 5 |
| Global UI state | Zustand 5 |
| HTTP | Axios |
| Styles | Tailwind CSS 4 + CSS design tokens |
| Linting | ESLint 9 + typescript-eslint |

### Database and tooling

| Technology | Purpose |
|---|---|
| PostgreSQL 16 | Main relational database |
| Docker Compose | Local PostgreSQL instance (host port `5433`) |
| pgvector | Planned for the AI phase |

---

## 7. Data model

The current schema consists of six tables:

| Table | Purpose |
|---|---|
| `users` | Account, password hash, display name, email verification flag |
| `refresh_tokens` | Active refresh token per user, hashed, with expiry |
| `email_verification_tokens` | Email verification tokens, hashed, with expiry |
| `password_reset_tokens` | Password reset tokens, hashed, expiry and `used_at` |
| `note_nodes` | Folder/note tree: `type`, `parent_id`, `title`, `content`, `sort_order` |
| `task_nodes` | List/task tree: `type`, `parent_id`, `title`, `description`, `priority`, `due_date`, `status` |

Enums:

- `notes_node_type`: `FOLDER`, `NOTE`
- `tasks_node_type`: `LIST`, `TASK`
- `tasks_priority`: `LOW`, `MEDIUM`, `HIGH`
- `tasks_status`: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`

All business tables include `user_id`, timestamps and (for notes/tasks) `deleted_at`.

### Migrations

Migrations live in `smooth-manage-bk/src/main/resources/db/migration` and run with Flyway:

- `V01__create_enums.sql`
- `V02__create_schema.sql`
- `V03__add_indexes.sql`
- `V04__validate_task_node_trigger.sql`
- `V05__validate_note_node_trigger.sql`
- `V07__fix_task_trigger_and_blocked_status.sql`

Rules:

- Never edit a migration that has already been applied. Add a new one.
- The next migration must continue after the highest existing version (`V08`), even though the repository currently has no `V06`.
- Migrations are the source of truth for the schema in every environment.

### Integrity rules enforced in the database

- A note can only be placed under a `FOLDER` owned by the same user.
- Moving a note into its own descendant is rejected.
- A folder cannot have content.
- A task can only be placed under a `LIST` owned by the same user.
- A list cannot have a description.

These rules complement the validation in the services, so direct SQL access cannot corrupt the tree.

---

## 8. API

All endpoints are versioned under `/api/v1`. Requests use JSON and authenticated routes require `Authorization: Bearer <access-token>`.

### Auth

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Create account and issue tokens |
| `POST` | `/api/v1/auth/login` | Authenticate and issue tokens |
| `POST` | `/api/v1/auth/refresh` | Rotate the refresh token |
| `POST` | `/api/v1/auth/logout` | Invalidate the active refresh token |
| `POST` | `/api/v1/auth/verify-email` | Verify email with token |
| `POST` | `/api/v1/auth/forgot-password` | Send reset email |
| `POST` | `/api/v1/auth/reset-password` | Reset password with token |
| `POST` | `/api/v1/auth/change-password` | Change password of the current user |
| `GET` | `/api/v1/auth/me` | Current user profile |

`register`, `login`, `refresh`, `verify-email`, `forgot-password` and `reset-password` are public. The rest require authentication.

### Notes

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/notes/folders` | Create folder |
| `POST` | `/api/v1/notes` | Create note |
| `PUT` | `/api/v1/notes/{id}` | Update title, content, parent or order |
| `DELETE` | `/api/v1/notes/{id}` | Delete node and its subtree |
| `GET` | `/api/v1/notes/{id}` | Get one node |
| `GET` | `/api/v1/notes` | Get all nodes of the user |
| `GET` | `/api/v1/notes/parent/{parentId}` | Get children of a node |
| `GET` | `/api/v1/notes/root` | Get root nodes |

### Tasks

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/tasks` | Create list or task |
| `PUT` | `/api/v1/tasks/{id}` | Update task/list |
| `DELETE` | `/api/v1/tasks/{id}` | Delete node |
| `GET` | `/api/v1/tasks/{id}` | Get one node |
| `GET` | `/api/v1/tasks` | Get all nodes of the user |
| `GET` | `/api/v1/tasks/parent/{parentId}` | Get children of a node |
| `GET` | `/api/v1/tasks/root` | Get root nodes |

Interactive API documentation is available at `/swagger-ui.html` and the OpenAPI JSON at `/v3/api-docs`.

---

## 9. Frontend

### Routes

| Route | Screen |
|---|---|
| `/` | Redirects to `/notes` or `/login` depending on the session |
| `/login` | Login |
| `/register` | Registration |
| `/forgot` | Forgot password |
| `/notes` | Notes (protected) |
| `/tasks` | Tasks (protected) |
| `*` | Redirects to `/` |

`/notes` and `/tasks` are wrapped by `RequireAuth`; an expired or invalid session redirects to `/login`.

### Notes screen

Folder tree, search, Markdown edit/read modes, drag and drop between folders, rename (including `F2`), cascade delete with undo, and a resizable side panel whose width is persisted in `localStorage`.

### Tasks screen

Lists in the side panel, `All`/`Today` filters, list and board views, drag and drop between statuses, quick add, a detail drawer with Markdown description, priority/due date/status editing, and undo.

### State and data

- Each module owns its own state and view-model.
- The shared HTTP client (`src/shared/infrastructure/api.ts`) attaches the access token and refreshes it on `401`.
- Session tokens are stored through `src/shared/infrastructure/authTokens.ts`.
- The visual system and tokens are documented in [`front_style.md`](./front_style.md); the HTML sketches in this folder are the visual prototypes.

---

## 10. Running locally

### Prerequisites

- Java 21
- Node.js 20+ and npm
- Docker with Docker Compose

### 1. Database

```bash
docker compose -f smooth-manage-db/docker-compose.yml up -d
```

This starts PostgreSQL 16 on host port `5433` with database/user/password `smoothmanage` and a persistent volume.

### 2. Backend

```bash
cd smooth-manage-bk
./mvnw spring-boot:run
```

The backend starts on `http://localhost:8080`. It activates the `local` profile by default.

Sensitive configuration must live in `smooth-manage-bk/src/main/resources/application-local.properties`, which is git-ignored. It needs, at minimum:

- `spring.datasource.url`, `spring.datasource.username`, `spring.datasource.password`
- `jwt.signing-key`
- `spring.mail.*` for the SMTP account
- `app.frontend.url` and `app.email.from`

Never commit real credentials, SMTP passwords or JWT keys.

### 3. Frontend

```bash
cd smooth-manage-fnt
npm install
npm run dev
```

The SPA starts on `http://localhost:3000` and proxies `/api` to `http://localhost:8080`.

Available scripts:

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Type-check and production build |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |

### Local URLs

| Service | URL |
|---|---|
| Frontend | `http://localhost:3000` |
| Backend | `http://localhost:8080` |
| Swagger UI | `http://localhost:8080/swagger-ui.html` |
| PostgreSQL | `localhost:5433` |

---

## 11. How the project is managed from now on

This section is the working agreement for new changes.

### 11.1 Change goes inside a module

New behavior belongs to an existing module or to a new one. Do not put business logic in `shared`, controllers or React pages.

- Backend: create/extend `domain`, `application/port/in` and `port/out`, `application/service`, then the adapter in `infrastructure` and the endpoint in `interfaces`.
- Frontend: create the domain model, the use case, the port, the service, the adapter and finally the page/view-model.
- If a new module is needed, create it with the same internal layout and add it to the composition root.

### 11.2 Keep the dependency direction

- `domain` and `application` never import `infrastructure`, `interfaces`, Spring, HTTP, `window`, `document` or `localStorage`.
- Controllers/pages depend on `port/in`, not on service classes.
- Adapters implement `port/out`.
- Modules never import another module's internals; only their public contract or `port/in` interface.

### 11.3 API rules

- All routes live under `/api/v1`.
- Request/response bodies are DTOs, not domain entities.
- Every business query filters by the authenticated `user_id`.
- Errors return a consistent JSON shape through the global exception handler.
- Any new endpoint must be added to this README (or to the Swagger source) when it changes the public contract.

### 11.4 Database rules

- Schema changes always go through a new Flyway migration; never rely on Hibernate `ddl-auto` to modify the schema.
- Do not edit migrations that have already been applied.
- Version numbers are sequential; continue from the highest existing file.
- Add indexes for new query patterns and keep the per-user filter in mind.
- Tree integrity belongs in the database as well as in the service.

### 11.5 Security and data rules

- Passwords are always hashed with BCrypt; tokens are stored hashed.
- Secrets stay in `application-local.properties` (or environment variables), never in the repository.
- A user can only read or modify their own records.
- Public endpoints must be explicitly allowed in `SecurityConfig`.

### 11.6 Frontend rules

- Visible text goes through i18n; code and identifiers are in English.
- Use the design-system components and CSS tokens; do not hardcode colors, radii or spacing.
- Keep one visual behavior for every state (idle, hover, active, focus, error, empty, loading).
- Reuse the same screen component for global and project-scoped views (pass a primitive `projectId`, not another module's entity).

### 11.7 Quality and definition of done

A change is done when:

1. It respects the module boundaries and the dependency direction.
2. It has the corresponding migration/API/UI updates.
3. It compiles and passes `npm run build`, `npm run lint` and `./mvnw test`.
4. New behavior is covered by tests; the current test suite is still a placeholder and should be expanded as modules grow.
5. The README and `front_style.md` are updated if the structure, contract or conventions changed.

Commits follow the existing conventional style: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`.

---

## 12. Roadmap

### Done

- [x] Monorepo, Spring Boot base, React + Vite base
- [x] PostgreSQL + Flyway migrations
- [x] `auth`: registration, login, JWT, refresh rotation, email verification, password reset
- [x] `notes`: folder/note tree, CRUD, Markdown, drag and drop, undo
- [x] `tasks`: lists, tasks, priorities, due dates, statuses, board view, undo
- [x] Shared design system and application shell

### In progress / next

- [ ] `projects` module: cards, detail, progress, notes/tasks linking
- [ ] `workflows` module: custom states, transitions, kanban
- [ ] Real test coverage per module
- [ ] Replace remaining hardcoded/temporary frontend data flows with the formal repository contracts
- [ ] Pagination and performance for large trees/lists
- [ ] Externalize all secrets and remove `ddl-auto=update`
- [ ] Track the local `docker-compose.yml` in the repository

### Later

- [ ] Internal AI (RAG): embeddings, pgvector semantic search, Spring AI chat, conversation history
- [ ] OpenAPI/Swagger annotations and published contract
- [ ] Deployment with Docker Compose (frontend + backend + database)
- [ ] Observability and audit

---

## 13. Known gaps and technical debt

- `projects` is still disabled in the navigation.
- pgvector is not installed or used yet; the AI phase has not started.
- The backend uses `spring.jpa.hibernate.ddl-auto=update` in the local profile, which contradicts the Flyway-only rule.
- The only automated test is the Spring Boot context test.
- `smooth-manage-db/docker-compose.yml` is currently matched by the root `.gitignore`; a fresh clone will not get it unless that rule changes.
- The repository lacks `V06`; the next migration should be `V08`.
- `deleted_at` columns exist but the services currently delete rows physically.
- Handwritten sketches are prototypes, not the source of truth for the UI.

---

## 14. Documentation index

- [`front_style.md`](./front_style.md) — frontend architecture, folder rules, visual tokens, components and layout.
- `LoginSketch.html`, `NotasSketch.html`, `TareasSketch.html` — visual prototypes used as design reference.
- Backend API — Swagger UI at `/swagger-ui.html` when the application is running.

---

## 15. Key decisions

| Decision | Reason |
|---|---|
| Modular monolith | One deployment today, but modules can be extracted later without rewriting the domain. |
| Hexagonal architecture per module | Business rules do not depend on frameworks, databases or the UI. |
| Java + Spring Boot | Mature ecosystem and a single language for the backend. |
| React + TypeScript | Maintainable SPA with type safety. |
| PostgreSQL | Robust relational base for the tree structures and user-scoped data. |
| Flyway | Versioned, reproducible schema. |
| pgvector (planned) | Semantic search without adding a separate vector database. |
| Spring AI (planned) | Switch between local and cloud providers without changing business code. |
| Docker Compose | Reproducible local environment. |
