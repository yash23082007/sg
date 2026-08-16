"""
SkillGap FastAPI Main Application
Mounts CORS middleware, API routers, database lifespan auto-seeding, and uniform error handlers.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.core.database import engine, Base
from app.core.seed import seed_database
from app.api.routes import users, skills


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes database schema and auto-seeds baseline skills and candidate state on boot."""
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Cross-Origin Resource Sharing (CORS) Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uniform Validation Error Handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": exc.errors(),
            "error_code": "REQUEST_VALIDATION_ERROR",
            "status_code": 422,
        },
    )


# Mount API Routers
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(skills.router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint for container probes and load balancers."""
    return {
        "status": "healthy",
        "engine": "DAG Career Architecture",
        "version": settings.VERSION,
    }
