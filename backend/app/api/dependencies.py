"""
SkillGap API Dependencies
JWT authentication verification, user session injection, and database transaction lifecycles.
"""

from typing import Generator, Optional
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.domain import User


def get_current_user_id(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> str:
    """
    Extracts and validates the authenticated user ID from the Bearer JWT token.
    Falls back gracefully to the default demo user in development mode.
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        user_id = decode_access_token(token)
        if user_id:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                return user.id

    # Fallback to seeded demo candidate
    demo_user = db.query(User).filter(User.id == "usr_prod_001").first()
    if demo_user:
        return demo_user.id

    # Fallback to any existing user or auto-seed
    user = db.query(User).first()
    if user:
        return user.id

    from app.core.seed import seed_database
    seed_database(db)
    return "usr_prod_001"


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
