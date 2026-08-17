/**
 * @file index.ts
 * @description Single source of truth for all frontend data shapes and schemas.
 * 
 * Strict Engineering Rules:
 * 1. Zero `any` types: All components and API payloads must adhere to these interfaces.
 * 2. Contract Mirroring: These TypeScript interfaces mirror backend Pydantic models in `backend/app/schemas/payload.py`.
 */

// ============================================================================
// Core User & Candidate Domain
// ============================================================================

/** User identity and candidate target specification */
export interface User {
  /** Unique UUID identifier */
  id: string;
  /** Primary contact and login email */
  email: string;
  /** Candidate full name */
  name: string;
  /** Target engineering title (e.g., 'Full Stack AI Engineer') */
  target_role: string;
  /** Boolean flag tracking if candidate resume PDF has been parsed */
  resume_uploaded: boolean;
  /** ISO timestamp of record creation */
  created_at: string;
}

/** Directed Acyclic Graph (DAG) Skill Node */
export interface Skill {
  /** Unique skill node UUID */
  id: string;
  /** Canonical display name (e.g., 'FastAPI') */
  name: string;
  /** Normalized lowercase database token (e.g., 'fastapi') */
  normalized_key: string;
  /** Domain classification category */
  category: SkillCategory;
  /** Market demand index (0.0 to 1.0) derived from job corpus */
  demand_score: number;
}

/** Allowed skill classification domains */
export type SkillCategory =
  | "language"
  | "framework"
  | "database"
  | "devops"
  | "architecture"
  | "ai_ml"
  | "tooling"
  | "soft_skill";

/** Directed Acyclic Graph (DAG) Edge representing prerequisite relationships */
export interface SkillEdge {
  /** Unique edge UUID */
  id: string;
  /** Upstream prerequisite skill ID */
  prerequisite_id: string;
  /** Downstream dependent skill ID */
  dependent_id: string;
}

// ============================================================================
// User Proficiency & Verification
// ============================================================================

/** Candidate verified proficiency on a single skill node */
export interface UserSkillProficiency {
  skill_id: string;
  skill_name: string;
  /** Proficiency score (0 - 100) */
  proficiency: number;
  /** Origin of proficiency record */
  source: "resume" | "manual" | "assessment";
}

// ============================================================================
// Computed Skill Gap Analysis Matrix
// ============================================================================

/** Computed delta for a single skill in the candidate evaluation */
export interface SkillGapItem {
  skill_id: string;
  skill_name: string;
  category: SkillCategory;
  /** Verified candidate score (0 - 100) */
  current_proficiency: number;
  /** Architecture benchmark required for target role (0 - 100) */
  required_proficiency: number;
  /** Delta: required_proficiency - current_proficiency */
  gap: number;
  /** Priority score P computed via DAG mathematical model (0.00 - 1.00) */
  priority_score: number;
  /** Categorized readiness level */
  status: GapStatus;
  /** True if all upstream prerequisites have been cleared */
  readiness_gate?: boolean;
  /** List of upstream prerequisite skill names that are unmet */
  unmet_prerequisites?: string[];
}

/** Qualitative skill evaluation status */
export type GapStatus = "mastered" | "proficient" | "developing" | "critical";

/** Aggregate telemetry payload for The Cockpit dashboard */
export interface DashboardData {
  /** Overall readiness score (0 - 100) */
  overall_readiness: number;
  /** Total evaluated technical nodes */
  total_skills: number;
  /** Total nodes with proficiency >= 80% */
  mastered_count: number;
  /** Total nodes with critical gap blocking downstream progression */
  critical_count: number;
  /** Mean proficiency across all evaluated nodes */
  average_proficiency: number;
  /** High-density list of all evaluated skill nodes */
  skill_gaps: SkillGapItem[];
  telemetry_source?: string;
}

// ============================================================================
// Topological Execution Roadmap & Graph Topology
// ============================================================================

/** Single step in the strictly ordered DAG progression path */
export interface RoadmapStep {
  id: string;
  /** 1-based sequential step index */
  order: number;
  /** Skill title to acquire */
  skill_name: string;
  skill_id: string;
  category: SkillCategory;
  /** Technical syllabus and mastery objectives */
  description: string;
  /** Estimated study and implementation effort */
  estimated_hours: number;
  /** List of prerequisite skill names that must be cleared prior */
  prerequisites: string[];
  /** Progression status on this roadmap stage */
  status: RoadmapStepStatus;
}

/** Status of a stage in the execution roadmap */
export type RoadmapStepStatus = "completed" | "current" | "locked";

/** Full DAG graph node for visual topology */
export interface SkillGraphNode {
  id: string;
  name: string;
  normalized_key: string;
  category: string;
  level: number;
  required_level: number;
  status: "mastered" | "current" | "locked";
  demand_score: number;
  centrality: number;
  readiness_gate: boolean;
  unlocked_by: string[];
  unlocks: string[];
  topological_depth: number;
}

/** Directed prerequisite edge in the DAG */
export interface SkillGraphEdge {
  source: string;
  target: string;
  source_name: string;
  target_name: string;
}

/** Aggregate DAG topology payload */
export interface SkillGraphData {
  nodes: SkillGraphNode[];
  edges: SkillGraphEdge[];
  total_nodes: number;
  total_edges: number;
  telemetry_source?: string;
}

// ============================================================================
// Ingestion & HTTP API Payloads
// ============================================================================

/** Backend response after parsing a binary PDF resume */
export interface ResumeUploadResponse {
  success: boolean;
  extracted_skills: string[];
  matched_count: number;
  message: string;
  updated_readiness?: number;
  unlocked_skills?: string[];
}

/** Standard API error response */
export interface ApiError {
  detail: string;
  status_code: number;
}

// ============================================================================
// Navigation & UI Design Tokens
// ============================================================================

/** Sidebar navigation link configuration */
export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

/** Telemetry badge variant */
export type BadgeVariant = "critical" | "warning" | "mastered" | "neutral" | "info";
