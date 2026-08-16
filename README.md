# SkillGap // Autonomous Career Architecture Engine

> **A high-density, AI-powered career architecture platform.**  
> Computes career progression as a deterministic Directed Acyclic Graph (DAG) data structure.

[![Next.js](https://img.shields.io/badge/Next.js-15.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.1-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776ab?style=flat-square&logo=python)](https://python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript)](https://typescriptlang.org/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-d71e00?style=flat-square)](https://www.sqlalchemy.org/)

---

## 1. The "Anti-Vibe-Coded" Aesthetic Manifesto

SkillGap is designed like a technical **Cockpit** (inspired by Linear, Vercel, and Raycast).

- **The Canvas:** Strict monochromatic dark mode (`#0a0a0a` / `#0d0d0d`).
- **Geometry:** Sharp 1px borders (`border-white/10`, `border-white/5`) defining high-density modular grids.
- **Data Utility Dopamine Accents:**
  - **Electric Blue (`#3b82f6`)**: Active telemetry, focus states, and current pipeline stages.
  - **Emerald Green (`#10b981`)**: Mastered skills ($\ge 80\%$) and verified prerequisites.
  - **Neon Rose (`#f43f5e`)**: Critical skill gaps blocking downstream architectures.
  - **Amber (`#f59e0b`)**: Developing proficiencies and warnings.
- **Kinematics:** Hardware-accelerated transitions strictly animating `opacity` and `transform` (`scaleX`, `translateY`) at $150\text{ms}$ with zero layout thrashing.
- **Typography:** **Inter** for prose and **JetBrains Mono** for all telemetry, numbers, badges, and technical tokens.

---

## 2. Core Architecture & Mathematical Model

SkillGap calculates a deterministic **Priority Score ($P$)** for every unlearned skill in the DAG database:

$$P = \left( (D \times W_d) + (G \times W_g) + (V \times W_v) \right) \times R$$

### Variable Breakdown

| Variable | Description |
|---|---|
| **$D$ (Demand)** | Normalized market demand frequency $(0.0 - 1.0)$ in target job postings. |
| **$G$ (Gap)** | Required proficiency minus the candidate's current verified proficiency $(0.0 - 1.0)$. |
| **$V$ (Value)** | Graph centrality — number of downstream skills unlocked by mastering this node. |
| **$R$ (Readiness)** | **Strict Boolean Gate $(0 \text{ or } 1)$**. If upstream DAG prerequisites are not met, $R = 0$, strictly preventing premature skill recommendations. |
| **$W$ (Weights)** | Tunable constants ($W_d = 0.5$, $W_g = 0.3$, $W_v = 0.2$). |

---

## 3. Monorepo File Tree

```
skillg/
├── frontend/                     # Next.js 15 (App Router, Tailwind CSS v4, TypeScript)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # Root HTML (Inter + JetBrains Mono, Dark Canvas)
│   │   │   ├── globals.css       # Tailwind v4 imports, custom scrollbar, zero @apply
│   │   │   ├── page.tsx          # Landing Page (Kinetic hero typography & telemetry grid)
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx    # Persistent Left-Sidebar with active indicators
│   │   │       ├── page.tsx      # The Cockpit (54% readiness, KPIs, Core Skill Gap table)
│   │   │       ├── profile/      # Resume Ingestion (Hardware-accelerated PDF Dropzone)
│   │   │       │   └── page.tsx
│   │   │       ├── roadmap/      # Execution Roadmap (DAG topological sort timeline)
│   │   │       │   └── page.tsx
│   │   │       ├── skill-graph/  # Visual DAG Tech-Tree & Node Inspector
│   │   │       │   └── page.tsx
│   │   │       └── market-analysis/ # Market Demand & Velocity Valuation Matrix
│   │   │           └── page.tsx
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── ProgressBar.tsx # Transform-scaleX hardware-accelerated bar (Green/Red)
│   │   │   │   └── Badge.tsx       # Strict 1px border monospace badge
│   │   │   └── features/
│   │   │       └── Dropzone.tsx    # PDF dropzone with AST token normalization states
│   │   ├── lib/
│   │   │   └── api.ts            # Type-safe fetch client with deterministic mock fallbacks
│   │   └── types/
│   │       └── index.ts          # Strict TypeScript contract matching backend Pydantic schemas
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── postcss.config.mjs
│
├── backend/                      # Python 3.10+, FastAPI, SQLAlchemy, Pydantic
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── users.py      # /api/users endpoints
│   │   │   │   └── skills.py     # /api/skills endpoints
│   │   │   └── dependencies.py   # Auth & DB session injections
│   │   ├── core/
│   │   │   ├── config.py         # Pydantic BaseSettings config
│   │   │   └── database.py       # SQLAlchemy engine & sessionmaker
│   │   ├── models/
│   │   │   └── domain.py         # PostgreSQL DAG tables (User, Skill, SkillEdge, Proficiency)
│   │   ├── schemas/
│   │   │   └── payload.py        # Strict Pydantic input/output validation models
│   │   ├── services/
│   │   │   ├── graph.py          # DAG Priority Score [P] formula & topological traversal
│   │   │   └── nlp.py            # Resume token normalization & embedding mapping
│   │   └── main.py               # FastAPI entry point with CORS & router mounting
│   ├── requirements.txt
│   └── .env
│
├── .gitignore
├── architecture.md
└── README.md
```

---

## 4. Engineering Standards

1. **Zero `any` Types**: All UI component props, hooks, and API payloads are strictly typed in `src/types/index.ts`.
2. **No Logic in API Routes**: FastAPI endpoints (`api/routes/`) only validate payloads via Pydantic and delegate execution to `services/`.
3. **No `@apply` in Global CSS**: Tailwind CSS v4 utility classes are applied directly in React components.

---

## 5. Quickstart & Execution Guide

### Prerequisites
- Node.js 18+ (v24 LTS recommended)
- Python 3.10+
- PostgreSQL (optional for local mock mode)

### 1. Frontend Setup (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev

# Or build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to access the Cockpit.

### 2. Backend Setup (FastAPI)

```bash
cd backend

# Create & activate virtual environment (Windows PowerShell)
python -m venv venv
.\venv\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn app.main:app --reload --port 8000
```

Interactive OpenAPI documentation is live at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

## 6. License & Architecture

Architected with **Next.js 15**, **Tailwind CSS v4**, and **FastAPI** for high-density career engineering.