# Mentor-AI Assistant

**End-to-end AI learning platform that turns documents into chat answers, study guides, flashcards, and quizzes — with model training and analytics built in.**

Mentor-AI Assistant is a full-stack RAG study platform. Users upload PDFs, organize them into collections and projects, chat with citations over their content, and generate study material (flashcards, quizzes, study guides). It combines a **Next.js 16 frontend, NestJS backend, Python document-processing and retrieval engines, QLoRA fine-tuning pipeline, BullMQ background jobs, Postgres, Redis, and FastAPI AI sidecars** into a modular monorepo where each layer can evolve independently.

The core AI capabilities are exposed through a REST + WebSocket API, making the web app one consumer among others.

---

## What Mentor-AI Does

### Document Intelligence

Upload a PDF and get structured knowledge back.

```text
PDF
 ↓
Extract (PyMuPDF)
 ↓
Clean (unicode / whitespace / control chars)
 ↓
Detect headings + hierarchy
 ↓
Hierarchical chunking
 ↓
Knowledge Objects (JSON)
```

### Grounded Chat

Chat with citations over your documents and collections.

```text
Question
   ↓
Retrieval pipeline (dense / hybrid)
   ↓
Ranked units + citations
   ↓
LLM answer with evidence
```

### Study Generation

Turn the same knowledge base into learning material.

```text
Knowledge Objects
   ├──→ Flashcards + spaced study
   ├──→ Quizzes + results
   └──→ Study guides
```

### Model Training

Fine-tune and track models from the UI.

```text
Datasets (train.jsonl)
   ↓
Training jobs (BullMQ + AI training service)
   ↓
Adapters / checkpoints / exported models
   ↓
Model registry + admin health
```

---

## Features

| Feature | Description | Where |
|---|---|---|
| Auth + users | Register, login, JWT + refresh, roles, protected routes | `src/apps/web/backend/src/modules/auth`, `users/` |
| Documents | Upload PDFs, processing queue, viewer, metadata | `modules/documents`, `app/(app)/documents` |
| Collections | Group documents into searchable collections | `modules/collections`, `app/(app)/collections` |
| Chat | Conversations, citations, markdown + KaTeX, streaming gateway | `modules/chat`, `components/chat`, `features/chat` |
| Search | Semantic search across knowledge base | `modules/search`, `app/(app)/search` |
| Flashcards | Decks, study mode, progress | `modules/flashcards`, `app/(app)/flashcards` |
| Quizzes | Take quizzes, per-question results | `modules/quizzes`, `app/(app)/quizzes` |
| Study guides | Generated guides per topic | `modules/study-guides`, `app/(app)/study-guides` |
| Projects | Multi-document project workspaces | `modules/projects`, `app/(app)/projects` |
| Training | Launch/monitor fine-tuning jobs, GPU + loss charts | `modules/training`, `modules/models`, `app/(app)/training` |
| Dashboard | Stats, charts, activity | `modules/dashboard`, `app/(app)/dashboard` |
| Admin | AI services, health, queues, logs, users, learning analytics | `modules/admin`, `app/(app)/admin` |
| Notifications / settings / profile | Bell, preferences, theme, account | `modules/notifications`, `settings/`, `users/` |
| Mock mode | Full UI without backend via per-domain mocks | `src/apps/web/mock/` |
| Fine-tuning | QLoRA/SFT pipeline for 7B-instruct models | `packages/mentorai-finetuning` |

---

## Architecture

```text
┌─────────────────────────────┐      ┌──────────────────────────────────────┐
│  Next.js 16 web             │ HTTP │  NestJS backend (:3001)               │
│  React 19 + Tailwind v4     │◄────►│  ├── auth / users / settings          │
│  React-Query + Zustand       │ WS   │  ├── documents / collections / search │
│                             │      │  ├── chat (+ gateway) / generation    │
│  /(auth): login, register   │      │  ├── flashcards / quizzes / guides    │
│  /(app): dashboard, chat,   │      │  ├── projects / learning / models    │
│  documents, training, admin │      │  ├── training / admin / health        │
└─────────────────────────────┘      │  ├── BullMQ queues + Redis           │
                                     │  └── Postgres (TypeORM)              │
                                     └──────────────────┬───────────────────┘
                                                        │
                          ┌─────────────────────────────┼─────────────────────────────┐
                          ▼                             ▼                             ▼
                ┌──────────────────┐        ┌──────────────────┐            ┌──────────────────┐
                │ AI inference     │        │ AI processing    │            │ AI training      │
                │ :8010 → :8000    │        │ :8001            │            │ :8002            │
                │ Qwen2.5 default  │        │ document +       │            │ QLoRA jobs       │
                └──────────────────┘        │ retrieval pkgs   │            └──────────────────┘
                                            └──────────────────┘
```

Frontend ↔ backend contract:

```text
USE_MOCK = NEXT_PUBLIC_USE_MOCK !== "false"   (default true)
API_URL  = NEXT_PUBLIC_API_URL || http://localhost:3001/api/v1

getApiClient() → mock (local handlers) | real (axios + Bearer + refresh retry)
```

---

## Project Structure

```text
assistant/
│
├── src/
│   ├── apps/
│   │   └── web/                        # Main app (absorbed monorepo dir, no longer a submodule)
│   │       ├── app/
│   │       │   ├── (auth)/             # login, register, forgot/reset-password, verify-email
│   │       │   ├── (app)/              # dashboard, chat, documents, collections, projects,
│   │       │   │                       # search, flashcards, quizzes, study-guides, training,
│   │       │   │                       # models, progress, profile, settings, notifications, admin
│   │       │   ├── layout.tsx / page.tsx / globals.css
│   │       ├── components/             # chat, quiz, flashcard, studyguide, sidebar, ui/*, charts
│   │       ├── features/               # per-domain hooks (useChat, useDocuments, useTraining…)
│   │       ├── services/               # per-domain API clients (mock|real switch)
│   │       ├── stores/                 # auth, chat, preferences, ui (zustand)
│   │       ├── lib/api/                # client.ts, realClient.ts (axios), mockClient.ts
│   │       ├── mock/                   # per-domain data + handlers + seed.ts
│   │       ├── types/                  # *.types.ts per domain
│   │       ├── backend/                # NestJS API (mentorai-backend)
│   │       │   └── src/
│   │       │       ├── modules/        # 19 modules (auth … users, see table above)
│   │       │       ├── common/         # guards, decorators, filters
│   │       │       ├── shared/         # redis, ai-proxy, dto
│   │       │       ├── database/       # data-source, seed
│   │       │       └── main.ts / app.module.ts
│   │       ├── package.json / next.config.ts / tsconfig.json
│   │       └── .env.example / .env.local
│   ├── apps/api/                       # Placeholder (reserved)
│   ├── apps/worker/                    # Placeholder (jobs run via BullMQ in NestJS)
│   └── backend/                        # Placeholder (real backend is src/apps/web/backend)
│
├── packages/
│   ├── document_processing/            # PDF → Knowledge Objects (extract→clean→detect→chunk→export)
│   ├── retrieval/                      # Dense/hybrid retriever + ranker + citations + eval
│   ├── types/                          # Placeholder for shared types
│   └── mentorai-finetuning/            # QLoRA/SFT pipeline (configs, scripts, notebooks, models)
│
├── docs/
│   ├── architecture/                   # document_processing_engine.md, retrieval_engine.md
│   └── todos/todos.md
│
├── datasets/                           # raw/ + processed/ corpus
├── scripts/                            # extract_documents.py, generate_paper_metadata.py
├── evaluations/ / experiments/ / notebooks/   # Placeholders + exploration
├── pyproject.toml / uv.lock
└── README.md
```

> Note: `src/apps/web` used to be a nested git repo (shown grey on GitHub). It has been absorbed into this repo as a regular directory. `packages/mentorai-finetuning` intentionally remains a gitlink to `llm-fintuning-platform`.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, Radix UI, Framer Motion, React-Query 5, Zustand, React-Hook-Form + Zod, KaTeX, Recharts |
| Backend | NestJS 10, TypeORM, Postgres 16, Redis 7 + BullMQ, Socket.IO gateway, JWT, Throttler |
| AI services | FastAPI sidecars (inference / processing / training), Qwen2.5-0.5B default |
| Python engines | PyMuPDF, torch, transformers, peft, trl, accelerate, bitsandbytes |
| Infra | Docker + Compose, K8s-ready layout |
| Testing | ESLint, `tsc --noEmit`, Pytest (engines) |

---

## Quick Start

### 1. Frontend (mock mode — no backend needed)

```bash
cd src/apps/web
npm install
npm run dev
```

App at http://localhost:3000. Default `NEXT_PUBLIC_USE_MOCK` is `true`, so every page works from `mock/*/data.ts`.

### 2. Frontend against real backend

```bash
# src/apps/web/.env.local
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

```bash
npm run dev
```

### 3. Backend (NestJS + Postgres + Redis + AI sidecars)

```bash
cd src/apps/web/backend
cp .env.example .env          # then edit values (see Configuration)
docker compose up --build
```

Or run API directly:

```bash
npm install
npm run start:dev
```

API at http://localhost:3001, prefix `/api/v1`.

### 4. Python engines

```bash
python -m venv .venv && source .venv/bin/activate
pip install -e .
python scripts/extract_documents.py
```

### 5. Fine-tuning (package repo)

See `packages/mentorai-finetuning/README.md` — dataset → tokenize → SFT/QLoRA → eval → export. Training configs under `configs/training/` (`8gb`, `12gb_16gb`, `over_24gb`, `cpu` …).

---

## Configuration

Frontend (`src/apps/web/.env.example`):

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_USE_MOCK` | `true` = local mocks, `false` = real API (default `true`) |
| `NEXT_PUBLIC_API_URL` | Backend base URL (default `http://localhost:3001/api/v1`) |
| `NEXT_PUBLIC_APP_NAME` | Display name |

Backend (`src/apps/web/backend/.env.example`):

| Variable | Description |
|---|---|
| `APP_PORT` | API port (default `3001`) |
| `CORS_ORIGIN` | Allowed frontend origin (`http://localhost:3000`) |
| `DATABASE_URL` | Postgres URL (`postgresql://mentorai:***@postgres:5432/mentorai`) |
| `REDIS_URL` | Redis URL for BullMQ |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Auth signing secrets |
| `AI_INFERENCE_URL` | Inference sidecar (`http://ai-inference:8000`) |
| `AI_PROCESSING_URL` | Processing sidecar (`http://ai-processing:8001`) |
| `AI_TRAINING_URL` | Training sidecar (`http://ai-training:8002`) |
| `UPLOAD_DIR` / `MAX_FILE_SIZE_MB` | Upload storage + limit |

---

## API Endpoints

NestJS modules under `src/apps/web/backend/src/modules/` (prefix `/api/v1`). Interactive shape follows standard REST per module:

```text
POST /api/v1/auth/register, /auth/login, /auth/refresh
GET  /api/v1/documents, POST /api/v1/documents/upload
GET  /api/v1/collections, /api/v1/projects, /api/v1/search?q=
GET+POST /api/v1/chat, WS chat gateway
GET+POST /api/v1/flashcards, /api/v1/quizzes, /api/v1/study-guides
GET+POST /api/v1/training/jobs, /api/v1/models
GET  /api/v1/dashboard, /api/v1/health
GET  /api/v1/admin/{ai-services,queues,logs,users,learning-analytics}
```

Frontend service per domain in `src/apps/web/services/*.service.ts` picks mock vs real automatically.

---

## Current Capabilities

```text
┌─────────────────────────────────────────────┐
│            Mentor-AI Assistant              │
├─────────────────────────────────────────────┤
│                                             │
│  ✓ Auth + roles + refresh                   │
│  ✓ PDF upload + processing queue            │
│  ✓ Collections + projects                   │
│  ✓ Grounded chat with citations             │
│  ✓ Semantic search                          │
│  ✓ Flashcards + quizzes + study guides      │
│  ✓ Training jobs + model registry           │
│  ✓ Dashboard + progress + streaks           │
│  ✓ Admin (services/health/queues/logs)      │
│  ✓ Mock mode for frontend-only dev          │
│  ✓ QLoRA fine-tuning package                │
│  ✓ Docker Compose (pg + redis + AI svcs)    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Status

**Active development.** Web app + NestJS backend + Python engines are implemented and wired via mock/real switch. `src/apps/api`, `src/apps/worker`, `src/backend`, `packages/types`, `evaluations/`, `experiments/` remain placeholders for future extraction.

---

## License

Add your preferred license here.
