from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    target_role = Column(String, default="Full Stack AI Engineer")
    resume_uploaded = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    proficiencies = relationship("UserSkillProficiency", back_populates="user", cascade="all, delete-orphan")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, unique=True, index=True, nullable=False)
    normalized_key = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=False)  # language, framework, database, devops, ai_ml, architecture
    demand_score = Column(Float, default=0.5)  # 0.0 - 1.0

    # DAG relationships
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
    __tablename__ = "skill_edges"

    id = Column(String, primary_key=True, default=generate_uuid)
    prerequisite_id = Column(String, ForeignKey("skills.id"), nullable=False)
    dependent_id = Column(String, ForeignKey("skills.id"), nullable=False)

    prerequisite = relationship("Skill", foreign_keys=[prerequisite_id], back_populates="dependents")
    dependent = relationship("Skill", foreign_keys=[dependent_id], back_populates="prerequisites")


class UserSkillProficiency(Base):
    __tablename__ = "user_skill_proficiencies"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    skill_id = Column(String, ForeignKey("skills.id"), nullable=False)
    proficiency = Column(Integer, default=0)  # 0 - 100
    source = Column(String, default="resume")  # resume, manual, assessment
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="proficiencies")
    skill = relationship("Skill")
