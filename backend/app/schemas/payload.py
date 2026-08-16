from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class UserBase(BaseModel):
    email: str
    name: str
    target_role: Optional[str] = "Full Stack AI Engineer"


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    id: str
    resume_uploaded: bool
    created_at: datetime

    class Config:
        from_attributes = True


class SkillItem(BaseModel):
    id: str
    name: str
    normalized_key: str
    category: str
    demand_score: float

    class Config:
        from_attributes = True


class SkillGapItem(BaseModel):
    skill_id: str
    skill_name: str
    category: str
    current_proficiency: int
    required_proficiency: int
    gap: int
    priority_score: float
    status: str


class DashboardResponse(BaseModel):
    overall_readiness: int
    total_skills: int
    mastered_count: int
    critical_count: int
    average_proficiency: int
    skill_gaps: List[SkillGapItem]


class RoadmapStepResponse(BaseModel):
    id: str
    order: int
    skill_name: str
    skill_id: str
    category: str
    description: str
    estimated_hours: int
    prerequisites: List[str]
    status: str


class ResumeUploadResponse(BaseModel):
    success: bool
    extracted_skills: List[str]
    matched_count: int
    message: str
