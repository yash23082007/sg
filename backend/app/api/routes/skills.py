"""
SkillGap Skill & Graph Telemetry Routes
Endpoints for fetching dashboard telemetry, roadmap timelines, and inserting DAG prerequisite edges.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user_id
from app.core.database import get_db
from app.models.domain import Skill, SkillEdge
from app.schemas.payload import (
    DashboardResponse,
    RoadmapStepResponse,
    SkillItem,
    SkillEdgeCreate,
    SkillEdgeResponse,
)
from app.services.graph import GraphService

router = APIRouter(prefix="/skills", tags=["Skills"])


@router.get("", response_model=List[SkillItem])
def list_all_skills(db: Session = Depends(get_db)):
    """Returns the full catalog of skill nodes in the DAG database."""
    skills = db.query(Skill).all()
    if not skills:
        from app.core.seed import seed_database
        seed_database(db)
        skills = db.query(Skill).all()
    return skills


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard_telemetry(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Computes live high-density skill gap telemetry for the authenticated user,
    evaluating prerequisite gates and deterministic Priority Scores (P).
    """
    return GraphService.get_dashboard_analysis(user_id=user_id, db=db)


@router.get("/roadmap", response_model=List[RoadmapStepResponse])
def get_execution_roadmap(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Returns the topologically sorted prerequisite-resolved roadmap via Kahn's algorithm.
    """
    return GraphService.get_roadmap(user_id=user_id, db=db)


@router.post("/edges", response_model=SkillEdgeResponse, status_code=status.HTTP_201_CREATED)
def create_prerequisite_edge(
    payload: SkillEdgeCreate,
    db: Session = Depends(get_db),
):
    """
    Inserts a new prerequisite edge into the DAG.
    Strictly verifies that adding this edge does not introduce a circular dependency (raises 409 Conflict).
    """
    prereq = db.query(Skill).filter(Skill.id == payload.prerequisite_id).first()
    dep = db.query(Skill).filter(Skill.id == payload.dependent_id).first()

    if not prereq or not dep:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or both skill IDs specified for the prerequisite edge do not exist."
        )

    # 1. Check for duplicate edge
    existing = db.query(SkillEdge).filter(
        SkillEdge.prerequisite_id == payload.prerequisite_id,
        SkillEdge.dependent_id == payload.dependent_id
    ).first()
    if existing:
        return existing

    # 2. Cycle Detection Verification (Kahn's algorithm)
    GraphService.assert_acyclic(
        db=db,
        proposed_prereq_id=payload.prerequisite_id,
        proposed_dep_id=payload.dependent_id
    )

    # 3. Insert Edge
    edge = SkillEdge(
        prerequisite_id=payload.prerequisite_id,
        dependent_id=payload.dependent_id
    )
    db.add(edge)
    db.commit()
    db.refresh(edge)

    # 4. Recompute downstream centrality (V) for all nodes
    GraphService.compute_centrality_for_all_skills(db)

    return edge
