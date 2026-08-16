// ============================================================================
// SkillGap — Strict Type Definitions
// The single source of truth for all data shapes across the frontend.
// Zero `any` types. Every interface mirrors the backend Pydantic schemas.
// ============================================================================

// --- Core Domain ---

export interface User {
  id: string;
  email: string;
  name: string;
  target_role: string;
  resume_uploaded: boolean;
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
  normalized_key: string;
  category: SkillCategory;
  demand_score: number; // 0.0 – 1.0
}

export type SkillCategory =
  | "language"
  | "framework"
  | "database"
  | "devops"
  | "architecture"
  | "ai_ml"
  | "tooling"
  | "soft_skill";

export interface SkillEdge {
  id: string;
  prerequisite_id: string;
  dependent_id: string;
}

// --- User Proficiency ---

export interface UserSkillProficiency {
  skill_id: string;
  skill_name: string;
  proficiency: number; // 0 – 100
  source: "resume" | "manual" | "assessment";
}

// --- Computed Analysis ---

export interface SkillGapItem {
  skill_id: string;
  skill_name: string;
  category: SkillCategory;
  current_proficiency: number;  // 0 – 100
  required_proficiency: number; // 0 – 100
  gap: number;                  // required - current
  priority_score: number;       // computed P score (0.0 – 1.0)
  status: GapStatus;
}

export type GapStatus = "mastered" | "proficient" | "developing" | "critical";

export interface DashboardData {
  overall_readiness: number; // 0 – 100
  total_skills: number;
  mastered_count: number;
  critical_count: number;
  average_proficiency: number;
  skill_gaps: SkillGapItem[];
}

// --- Roadmap ---

export interface RoadmapStep {
  id: string;
  order: number;
  skill_name: string;
  skill_id: string;
  category: SkillCategory;
  description: string;
  estimated_hours: number;
  prerequisites: string[];
  status: RoadmapStepStatus;
}

export type RoadmapStepStatus = "completed" | "current" | "locked";

// --- API Responses ---

export interface ResumeUploadResponse {
  success: boolean;
  extracted_skills: string[];
  matched_count: number;
  message: string;
}

export interface ApiError {
  detail: string;
  status_code: number;
}

// --- UI ---

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export type BadgeVariant = "critical" | "warning" | "mastered" | "neutral" | "info";
