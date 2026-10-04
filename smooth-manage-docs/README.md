# SmoothManage

## 1. Vision

A single application (backend + frontend) that brings together:

- **Notes** (free form Markdown), organized by node type as folder or note.
- **Activities / Tasks** you want or need to do, with priority and deadline.

Everything designed to **grow easily**: it is built small and simple, but with an architecture that lets you add features without redoing anything.

---
## 2. The design pattern: Modular Monolith

> **Modular Monolith** = a single deployable application (a single JAR), but organized internally into **modules with clear boundaries**. Each module is independent, with its own domain, its own rules and its own internal API.

### And how does it scale?

If a module grows too much, it can be **extracted** into a microservice without touching the rest. The modules are already separated, so extraction is like "copy the folder and expose it over HTTP".

### Modular monolith rules

1. A module does **not import** the internal classes of another module directly.
2. Modules communicate through **interfaces** (for example: `NotesService`, `TasksRepository`).
3. Each module follows **Hexagonal / Clean Architecture** internally (domain, application, infrastructure).
4. A single final artifact (a Spring Boot JAR), no matter how many modules there are.
5. `auth` and `shared` are base modules that everything depends on (but business modules do not depend on each other).

```
┌──────────────────────────────────┐
│         SPRING BOOT (JAR)        │
│  ┌──────┐ ┌──────┐ ┌──────┐      │
│  │ auth │ │notes │ │tasks │      │
│  └──┬───┘ └──┬───┘ └──┬───┘      │
│     │        │        │          │
│  ┌──┴────────┴────────┴───────┐  │
│  │    shared (common base)    │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

---

## 3. Technology stack

### Backend (Java, as much as possible)
| Layer | Technology | Why |
|---|---|---|
| Language | **Java 21 (LTS)** | Project base |
| Framework | **Spring Boot 3** | Standard, mature, dependency injection |
| Security | **Spring Security + JWT** | Multi-user login |
| Persistence | **Spring Data JPA** | ORM, repositories per module |
| DB migrations | **Flyway** | Schema versioning in `database/` |
| AI | **Spring AI** | Provider abstraction (local or cloud) |
| Build | **Maven** | Multi-module management |
| Tests | JUnit 5 + Mockito | Unit tests per module |

### Frontend (React)

| Layer | Technology | Why |
|---|---|---|
| Framework | **React 18 + Vite + TypeScript** | Development speed and type safety |
| Routing | **React Router** | Navigation (notes, tasks, projects, chat) |
| Server state | **TanStack Query** | Cache + sync with the REST API |
| Global state | **Zustand** | Lightweight, for UI (theme, session) |
| Styles | **TailwindCSS** | Fast, consistent prototyping |
| Notes editor | **TipTap** | WYSIWYG Markdown |

### Database

| Technology | Why |
|---|---|
| **PostgreSQL 16** | Relational, robust |

### Deployment

| Technology | Why |
|---|---|
| **Docker + Docker Compose** | Bring up DB, backend and frontend with a single command |
---

## 4. General architecture

```
 Browser (React SPA)
       │  HTTPS / JSON
       ▼
 ┌───────────────────────────┐
 │ REST API (Spring Boot)    │   Modular Monolith
 │  · auth (JWT)             │
 │  · /api/v1/notes          │
 │  · /api/v1/tasks          │
 └─────────────┬─────────────┘
               │
       ┌───────┴────────┐
       │   PostgreSQL   │
       └────────────────┘
```

**Data flow with the internal AI:**

```
[User notes/tasks/projects]
        │  ingestion (on save)
        ▼
[Generate embedding → pgvector]
        │
        ▼
[User question → Spring AI]
        │  semantic search (only YOUR content)
        ▼
[Retrieved context + question → LLM]
        │
        ▼
[Contextualized answer]
```
---

## 5. Functional modules (planned vs implemented)

| Module | Responsibility | Status |
|---|---|---|
| **`auth`** | Registration, login, JWT, user profile | 📋 Planned |
| **`notes`** | Markdown notes, folders, tags, search, favorites | 📋 Planned |
| **`tasks`** | Activities: title, priority, deadline, status, task lists | 📋 Planned |
| **`shared`** | Common base: security, audit, utilities, error handling | 📋 Planned |

**Key rule:** all business modules **filter by user** (nobody sees another user's data). The AI too: it only queries the authenticated user's content.

---

## 6. Repository structure

```
PRY-NoNotion/
├── backend/                 # Java modules (modular monolith)
│   ├── pom.xml
│   └── src/main/java/com/nonotion/
│       ├── shared/          # security, errors, utilities
│       ├── auth/            # (planned)
│       ├── notes/           # (planned)
│       ├── tasks/           # (planned)
│       ├── projects/        # (planned)
│       ├── workflows/       # (planned)
│       └── ai/              # (planned)
├── frontend/                # React + Vite + TypeScript
│   ├── src/
│   │   ├── modules/
│   │   │   ├── shared/      # API client, auth, error handling
│   │   │   ├── auth/        # (planned)
│   │   │   ├── notes/       # (planned)
│   │   │   └── tasks/       # (planned)
│   │   └── ...
│   └── package.json
├── database/
│   ├── docker-compose.yml   # PostgreSQL + pgvector
│   ├── migrations/          # Flyway SQL migrations
│   └── seeds/               # Demo data
└── docs/
    └── README.md            # This document
```

**Note on migrations:** it is recommended to keep them with Flyway inside `backend/src/main/resources/db/migration` (they travel with the backend), and leave only the `docker-compose.yml` and init scripts in `database/`.

---


## 7. Phased roadmap

Each phase leaves the app **usable** and builds on top of the previous one.

### Phase 0 — Skeleton 
- [ ] Folder structure backend/frontend/database
- [ ] Base Spring Boot + empty modules + `shared`
- [ ] React + Vite + Tailwind base
- [ ] `docker-compose.yml` (PostgreSQL + pgvector)
- [ ] Flyway + migrations
- [ ] **`auth` module**: registration, login, JWT (Spring Security)

### Phase 1 — Notes 
- [ ] Notes CRUD (Markdown, folders, tags)
- [ ] Categories and tags
- [ ] Basic search
- [ ] Notes screen in React (TipTap editor)

### Phase 2 — Tasks 
- [ ] Task lists CRUD
- [ ] Tasks CRUD (priority, due date, status)
- [ ] Tasks screen in React (list + board view)

### Phase 3 — Projects
- [ ] Projects CRUD
- [ ] Link projects to notes and tasks
- [ ] Project dashboard

### Phase 4 — Workflows
- [ ] Define states and transitions per user
- [ ] Move tasks between states with rules
- [ ] Kanban board per workflow

### Phase 5 — Internal AI (RAG)
- [ ] Generate embeddings when saving content
- [ ] Semantic search (pgvector) per user
- [ ] Chat with Spring AI (configurable engine: Ollama/cloud)
- [ ] Conversation history

### Phase 6 — Polish
- [ ] Unit and integration tests per module
- [ ] Pagination and performance
- [ ] API documentation (OpenAPI/Swagger)

---

## 8. Key decisions (and why)

| Decision | Why |
|---|---|
| **Modular Monolith** | Simple today, extensible tomorrow. Modules are added, not services. |
| **Java + Spring Boot** | Whole backend in Java, mature and with a big ecosystem. |
| **React + TypeScript** | Modern and maintainable frontend. |
| **pgvector** | Semantic search without setting up extra infra (Elasticsearch/separate vector DB). |
| **Spring AI** | Abstracts the AI: you start free with local Ollama and migrate to cloud without changing code. |
| **Docker Compose** | Reproducible environment in a single command. |

---

## 9. Project conventions

- **Project language:** everything in English (code, convention names, docs and UI). The only Spanish is the personal learning note at the top.
- **Versioned API:** `/api/v1/...`.
- **Data isolated per user:** every query filters by `user_id` (row-level multi-tenant security).
- **No unnecessary comments:** the code must explain itself.
- **A module doesn't know how the others are implemented** (only their interfaces).
- **Migrations always with Flyway**, never `ddl-auto: update` in production.