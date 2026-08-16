from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import users, skills

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(skills.router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "engine": "DAG Career Architecture",
        "version": settings.VERSION,
    }
