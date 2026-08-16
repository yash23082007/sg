"""
SkillGap User & Resume Routes
Handles user registration, authentication, profile queries, and binary resume ingestion.
Strictly delegates business logic to services.
"""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.api.dependencies import get_current_user_id, get_current_user
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.domain import User
from app.schemas.payload import (
    UserResponse,
    ResumeUploadResponse,
    UserRegisterRequest,
    UserLoginRequest,
    AuthTokenResponse,
)
from app.services.nlp import NLPService

router = APIRouter(prefix="/users", tags=["Users"])

MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB safety limit


@router.post("/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    """Registers a new candidate user account."""
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    user = User(
        email=payload.email,
        name=payload.name,
        hashed_password=hash_password(payload.password),
        target_role=payload.target_role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id)
    return AuthTokenResponse(
        access_token=token,
        user_id=user.id,
        email=user.email,
        name=user.name,
    )


@router.post("/login", response_model=AuthTokenResponse)
def login_user(payload: UserLoginRequest, db: Session = Depends(get_db)):
    """Authenticates candidate credentials and returns JWT token."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials."
        )

    token = create_access_token(subject=user.id)
    return AuthTokenResponse(
        access_token=token,
        user_id=user.id,
        email=user.email,
        name=user.name,
    )


@router.get("/me", response_model=UserResponse)
def get_user_profile(
    user: User = Depends(get_current_user),
):
    """Returns the authenticated candidate's profile metadata from the database."""
    return user


@router.post("/resume", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Receives PDF, DOCX, or TXT resume document, enforces a 5MB size limit,
    extracts technical AST tokens via NLPService, and updates DB proficiencies.
    """
    filename = file.filename or "resume.pdf"
    name_lower = filename.lower()

    if not (name_lower.endswith(".pdf") or name_lower.endswith(".docx") or name_lower.endswith(".txt") or name_lower.endswith(".md")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported format: Only .pdf, .docx, and .txt documents are permitted.",
        )

    file_bytes = await file.read()
    if len(file_bytes) > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Payload exceeds maximum allowed size of {MAX_UPLOAD_SIZE_BYTES // (1024*1024)} MB.",
        )

    response = NLPService.parse_and_normalize_resume(
        file_bytes=file_bytes,
        filename=filename,
        user_id=user_id,
        db=db,
    )
    return response
