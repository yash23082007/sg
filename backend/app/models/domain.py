"""
SkillGap SQLAlchemy Domain Models
Directed Acyclic Graph (DAG) schema for skills, prerequisite edges, users, and proficiencies.
"""

from datetime import datetime, timezone
import uuid
from sqlalchemy import (
    Column,
    String,
    Float,
    ForeignKey,
    DateTime,
    Boolean,
    Text,
    CheckConstraint,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def get_utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    """User account and career architecture profile."""
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=True)
    target_role = Column(String, default="Full Stack AI Engineer", nullable=False)
    resume_uploaded = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    proficiencies = relationship(
        "UserSkillProficiency",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class Skill(Base):
    """Technical skill node within the Directed Acyclic Graph (DAG)."""
    __tablename__ = "skills"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, unique=True, index=True, nullable=False)
    normalized_key = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=False)  # language, framework, database, devops, ai_ml, architecture
    demand_score = Column(Float, default=0.5, nullable=False)  # 0.0 to 1.0 (D)
    required_proficiency = Column(Float, default=0.8, nullable=False)  # Target benchmark (0.0 to 1.0)
    centrality = Column(Float, default=0.0, nullable=False)  # Transitive downstream descendant count (V)
    estimated_hours = Column(Float, default=16.0, nullable=False)
    description = Column(Text, default="", nullable=False)

    __table_args__ = (
        CheckConstraint("demand_score >= 0.0 AND demand_score <= 1.0", name="check_demand_score_range"),
        CheckConstraint("required_proficiency >= 0.0 AND required_proficiency <= 1.0", name="check_req_prof_range"),
    )

    # DAG relationships (Prerequisites & Dependents)
    prerequisites = relationship(
        "SkillEdge",
        foreign_keys="[SkillEdge.dependent_id]",
        back_populates="dependent",
        cascade="all, delete-orphan",
    )
    dependents = relationship(
        "SkillEdge",
        foreign_keys="[SkillEdge.prerequisite_id]",
        back_populates="prerequisite",
        cascade="all, delete-orphan",
    )


class SkillEdge(Base):
    """
    Directed Acyclic Graph (DAG) prerequisite edge.
    prerequisite_id MUST be mastered before dependent_id can be unlocked.
    """
    __tablename__ = "skill_edges"

    id = Column(String, primary_key=True, default=generate_uuid)
    prerequisite_id = Column(String, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    dependent_id = Column(String, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)

    __table_args__ = (
        UniqueConstraint("prerequisite_id", "dependent_id", name="uq_prerequisite_dependent"),
        CheckConstraint("prerequisite_id != dependent_id", name="check_no_self_loops"),
    )

    prerequisite = relationship("Skill", foreign_keys=[prerequisite_id], back_populates="dependents")
    dependent = relationship("Skill", foreign_keys=[dependent_id], back_populates="prerequisites")


class UserSkillProficiency(Base):
    """Candidate verified proficiency on a given DAG skill node."""
    __tablename__ = "user_skill_proficiencies"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(String, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    proficiency = Column(Float, default=0.0, nullable=False)  # Normalized 0.0 to 1.0
    source = Column(String, default="resume", nullable=False)  # resume, assessment, manual
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "skill_id", name="uq_user_skill"),
        CheckConstraint("proficiency >= 0.0 AND proficiency <= 1.0", name="check_proficiency_range"),
    )

    user = relationship("User", back_populates="proficiencies")
    skill = relationship("Skill")
