from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.dependencies import get_current_user_id
from app.core.database import get_db
from app.schemas.payload import DashboardResponse, RoadmapStepResponse
from app.services.graph import GraphService

router = APIRouter(prefix="/skills", tags=["Skills"])


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard_telemetry(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Fetches the high-density skill gap telemetry payload.
    """
    return GraphService.get_dashboard_analysis(user_id=user_id, db=db)


@router.get("/roadmap", response_model=List[RoadmapStepResponse])
def get_execution_roadmap(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Fetches the topologically sorted prerequisite roadmap.
    """
    return GraphService.get_roadmap(user_id=user_id, db=db)
