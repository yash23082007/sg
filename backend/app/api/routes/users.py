from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import get_current_user_id
from app.core.database import get_db
from app.schemas.payload import UserResponse, ResumeUploadResponse
from app.services.nlp import NLPService
from datetime import datetime

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_current_user(user_id: str = Depends(get_current_user_id)):
    """
    Returns the authenticated user's profile metadata.
    """
    return UserResponse(
        id=user_id,
        email="staff.engineer@skillgap.dev",
        name="Staff Engineer",
        target_role="Full Stack AI Engineer",
        resume_uploaded=True,
        created_at=datetime.utcnow(),
    )


@router.post("/resume", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
):
    """
    Receives PDF resume, validates format, and delegates extraction to NLPService.
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Strict validation error: Only binary .pdf documents are supported.",
        )

    file_bytes = await file.read()
    response = NLPService.parse_and_normalize_resume(file_bytes, file.filename)
    return response
