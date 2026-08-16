"""
SkillGap Pydantic Schemas
Strict data validation for incoming requests and serialized outgoing payloads.
"""

from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, EmailStr


# ============================================================================
# User & Auth Schemas
# ============================================================================

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=2)
    target_role: str = "Full Stack AI Engineer"


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    name: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    target_role: str
    resume_uploaded: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Skill & Graph Schemas
# ============================================================================

class SkillItem(BaseModel):
    id: str
    name: str
    normalized_key: str
    category: str
    demand_score: float
    required_proficiency: float
    centrality: float
    estimated_hours: float
    description: str

    model_config = ConfigDict(from_attributes=True)


class SkillEdgeCreate(BaseModel):
    prerequisite_id: str
    dependent_id: str


class SkillEdgeResponse(BaseModel):
    id: str
    prerequisite_id: str
    dependent_id: str

    model_config = ConfigDict(from_attributes=True)


class SkillGapItem(BaseModel):
    skill_id: str
    skill_name: str
    category: str
    current_proficiency: int  # 0 - 100 for UI consumption
    required_proficiency: int # 0 - 100 for UI consumption
    gap: int                  # Delta in percentage points
    priority_score: float     # 0.00 - 1.00 computed P score
    status: str               # mastered, proficient, developing, critical
    readiness_gate: bool      # True if all upstream prerequisites are cleared
    unmet_prerequisites: List[str] = Field(default_factory=list)


class DashboardResponse(BaseModel):
    overall_readiness: int
    total_skills: int
    mastered_count: int
    critical_count: int
    average_proficiency: int
    skill_gaps: List[SkillGapItem]
    telemetry_source: str = "live_dag_engine"


class RoadmapStepResponse(BaseModel):
    id: str
    order: int
    skill_name: str
    skill_id: str
    category: str
    description: str
    estimated_hours: int
    prerequisites: List[str]
    status: str  # completed, current, locked


# ============================================================================
# NLP Ingestion Schemas
# ============================================================================

class ExtractedSkillToken(BaseModel):
    name: str
    category: str
    inferred_proficiency: int
    confidence: float


class ResumeUploadResponse(BaseModel):
    success: bool
    extracted_skills: List[str]
    matched_count: int
    message: str
    updated_readiness: Optional[int] = None
    unlocked_skills: List[str] = Field(default_factory=list)


class ErrorResponse(BaseModel):
    detail: str
    error_code: str = "VALIDATION_OR_ENGINE_ERROR"
    status_code: int
