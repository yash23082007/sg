"""
SkillGap Database Connection & Session Management
Supports both PostgreSQL connection pooling and SQLite with strict foreign key PRAGMA.
"""

from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

db_url = settings.DATABASE_URL

if db_url.startswith("postgresql"):
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )
else:
    # SQLite configuration for zero-config local development and testing
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False}
    )

    # Enforce foreign key constraints on SQLite
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency yielding a thread-local SQLAlchemy database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
