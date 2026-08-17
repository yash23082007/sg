"""
SkillGap API Dependencies
JWT authentication verification, user session injection, and database transaction lifecycles.
"""

from typing import Generator, Optional
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.domain import User


def get_current_user_id(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> str:
    """
    Extracts and validates the authenticated user ID from the Bearer JWT token.
    Enforces strict token validation (raising 401 on forged/expired/malformed tokens).
    Falls back gracefully to the default demo user only when no Authorization header is provided in development mode.
    """
    if authorization:
        if not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Malformed Authorization header. Format must be 'Bearer <token>'.",
            )
        parts = authorization.split(" ", 1)
        if len(parts) != 2 or not parts[1].strip():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Malformed Authorization header.",
            )
        token = parts[1].strip()
        user_id = decode_access_token(token)
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token is invalid or expired.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User no longer exists.",
            )
        return user.id

    # No Authorization header provided: allow demo fallback only in development environments
    if settings.ENVIRONMENT.lower() in ("development", "dev", "test", "testing"):
        demo_user = db.query(User).filter(User.id == "usr_prod_001").first()
        if demo_user:
            return demo_user.id

        user = db.query(User).first()
        if user:
            return user.id

        from app.core.seed import seed_database
        seed_database(db)
        return "usr_prod_001"

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated.",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> User:
    """Retrieves the full User ORM entity for the active session."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Authenticated user record not found in database."
        )
    return user
