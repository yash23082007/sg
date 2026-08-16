from typing import Generator
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db


def get_current_user_id() -> str:
    """
    Mock authenticated user ID for the current session.
    """
    return "usr_prod_001"
