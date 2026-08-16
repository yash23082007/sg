// ============================================================================
// SkillGap — API Client
// Type-safe fetch wrapper with realistic mock data.
// The frontend runs fully standalone until the FastAPI backend is wired.
// ============================================================================

import type {
  DashboardData,
  RoadmapStep,
  ResumeUploadResponse,
  SkillGapItem,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// --- Generic Fetch Wrapper ---

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Network error" }));
    throw new Error(error.detail ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ============================================================================
// MOCK DATA — Realistic skill gap analysis for a "Full Stack AI Engineer" role
// ============================================================================

const MOCK_SKILL_GAPS: SkillGapItem[] = [
  {
    skill_id: "s-001",
    skill_name: "Python",
    category: "language",
    current_proficiency: 88,
    required_proficiency: 90,
    gap: 2,
    priority_score: 0.12,
    status: "mastered",
  },
  {
    skill_id: "s-002",
    skill_name: "TypeScript",
    category: "language",
    current_proficiency: 82,
    required_proficiency: 85,
    gap: 3,
    priority_score: 0.18,
    status: "mastered",
  },
  {
    skill_id: "s-003",
    skill_name: "Next.js",
    category: "framework",
    current_proficiency: 72,
    required_proficiency: 85,
    gap: 13,
    priority_score: 0.64,
    status: "developing",
  },
  {
    skill_id: "s-004",
    skill_name: "FastAPI",
    category: "framework",
    current_proficiency: 65,
    required_proficiency: 80,
    gap: 15,
    priority_score: 0.58,
    status: "developing",
  },
  {
    skill_id: "s-005",
    skill_name: "PostgreSQL",
    category: "database",
    current_proficiency: 55,
    required_proficiency: 75,
    gap: 20,
    priority_score: 0.72,
    status: "developing",
  },
  {
    skill_id: "s-006",
    skill_name: "Docker",
    category: "devops",
    current_proficiency: 30,
    required_proficiency: 70,
    gap: 40,
    priority_score: 0.85,
    status: "critical",
  },
  {
    skill_id: "s-007",
    skill_name: "Kubernetes",
    category: "devops",
    current_proficiency: 10,
    required_proficiency: 60,
    gap: 50,
    priority_score: 0.91,
    status: "critical",
  },
  {
    skill_id: "s-008",
    skill_name: "LangChain",
    category: "ai_ml",
    current_proficiency: 20,
    required_proficiency: 75,
    gap: 55,
    priority_score: 0.95,
    status: "critical",
  },
  {
    skill_id: "s-009",
    skill_name: "Vector DBs",
    category: "ai_ml",
    current_proficiency: 15,
    required_proficiency: 65,
    gap: 50,
    priority_score: 0.88,
    status: "critical",
  },
  {
    skill_id: "s-010",
    skill_name: "System Design",
    category: "architecture",
    current_proficiency: 45,
    required_proficiency: 80,
    gap: 35,
    priority_score: 0.78,
    status: "critical",
  },
  {
    skill_id: "s-011",
    skill_name: "CI/CD Pipelines",
    category: "devops",
    current_proficiency: 50,
    required_proficiency: 70,
    gap: 20,
    priority_score: 0.62,
    status: "developing",
  },
  {
    skill_id: "s-012",
    skill_name: "GraphQL",
    category: "framework",
    current_proficiency: 78,
    required_proficiency: 70,
    gap: -8,
    priority_score: 0.05,
    status: "mastered",
  },
];

const MOCK_DASHBOARD: DashboardData = {
  overall_readiness: 54,
  total_skills: 12,
  mastered_count: 3,
  critical_count: 5,
  average_proficiency: 51,
  skill_gaps: MOCK_SKILL_GAPS,
};

const MOCK_ROADMAP: RoadmapStep[] = [
  {
    id: "r-001",
    order: 1,
    skill_name: "Python Fundamentals",
    skill_id: "s-001",
    category: "language",
    description:
      "Solidify advanced Python patterns: generators, decorators, async/await, and type hints.",
    estimated_hours: 8,
    prerequisites: [],
    status: "completed",
  },
  {
    id: "r-002",
    order: 2,
    skill_name: "FastAPI Deep Dive",
    skill_id: "s-004",
    category: "framework",
    description:
      "Build production APIs with dependency injection, middleware, background tasks, and WebSockets.",
    estimated_hours: 20,
    prerequisites: ["Python Fundamentals"],
    status: "completed",
  },
  {
    id: "r-003",
    order: 3,
    skill_name: "PostgreSQL & SQLAlchemy",
    skill_id: "s-005",
    category: "database",
    description:
      "Master relational modeling, complex queries, indexing strategies, and ORM patterns with SQLAlchemy 2.0.",
    estimated_hours: 24,
    prerequisites: ["Python Fundamentals"],
    status: "current",
  },
  {
    id: "r-004",
    order: 4,
    skill_name: "Docker Containerization",
    skill_id: "s-006",
    category: "devops",
    description:
      "Containerize applications with multi-stage Dockerfiles, compose stacks, and networking fundamentals.",
    estimated_hours: 16,
    prerequisites: ["FastAPI Deep Dive", "PostgreSQL & SQLAlchemy"],
    status: "locked",
  },
  {
    id: "r-005",
    order: 5,
    skill_name: "System Design Patterns",
    skill_id: "s-010",
    category: "architecture",
    description:
      "Study distributed systems: load balancing, caching (Redis), message queues, and CAP theorem trade-offs.",
    estimated_hours: 30,
    prerequisites: ["Docker Containerization"],
    status: "locked",
  },
  {
    id: "r-006",
    order: 6,
    skill_name: "CI/CD Pipelines",
    skill_id: "s-011",
    category: "devops",
    description:
      "Automate testing and deployments with GitHub Actions, artifact registries, and blue-green deploy strategies.",
    estimated_hours: 12,
    prerequisites: ["Docker Containerization"],
    status: "locked",
  },
  {
    id: "r-007",
    order: 7,
    skill_name: "Kubernetes Orchestration",
    skill_id: "s-007",
    category: "devops",
    description:
      "Deploy and scale containerized workloads: pods, services, ingress, Helm charts, and resource limits.",
    estimated_hours: 32,
    prerequisites: ["Docker Containerization", "CI/CD Pipelines"],
    status: "locked",
  },
  {
    id: "r-008",
    order: 8,
    skill_name: "LangChain & LLM Engineering",
    skill_id: "s-008",
    category: "ai_ml",
    description:
      "Build RAG pipelines, agent architectures, tool-calling patterns, and prompt engineering with LangChain.",
    estimated_hours: 40,
    prerequisites: ["Python Fundamentals", "System Design Patterns"],
    status: "locked",
  },
  {
    id: "r-009",
    order: 9,
    skill_name: "Vector Databases",
    skill_id: "s-009",
    category: "ai_ml",
    description:
      "Implement semantic search with Pinecone/Chroma: embedding pipelines, indexing strategies, and hybrid search.",
    estimated_hours: 18,
    prerequisites: ["LangChain & LLM Engineering"],
    status: "locked",
  },
];

// ============================================================================
// PUBLIC API FUNCTIONS — switch from mock to live by replacing return values
// ============================================================================

const USE_MOCK = true;

export async function fetchDashboard(): Promise<DashboardData> {
  if (USE_MOCK) {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_DASHBOARD;
  }
  return apiFetch<DashboardData>("/api/skills/dashboard");
}

export async function fetchRoadmap(): Promise<RoadmapStep[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_ROADMAP;
  }
  return apiFetch<RoadmapStep[]>("/api/skills/roadmap");
}

export async function uploadResume(file: File): Promise<ResumeUploadResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1500));
    return {
      success: true,
      extracted_skills: [
        "Python",
        "TypeScript",
        "Next.js",
        "FastAPI",
        "PostgreSQL",
        "GraphQL",
        "React",
        "Tailwind CSS",
        "Git",
        "REST APIs",
      ],
      matched_count: 10,
      message: "Resume parsed successfully. 10 skills extracted and mapped.",
    };
  }

  const formData = new FormData();
  formData.append("file", file);

  const url = `${API_BASE_URL}/api/users/resume`;
  const res = await fetch(url, { method: "POST", body: formData });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(error.detail ?? `Upload failed: ${res.status}`);
  }

  return res.json() as Promise<ResumeUploadResponse>;
}
