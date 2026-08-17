"""
SkillGap Auth, Ingestion, & Graph API Integration Test Suite
Asserts token security, compressed PDF parsing, unlocked_skills diff computation,
and DAG graph topology endpoints.
"""

import io
import zlib
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from sqlalchemy.pool import StaticPool
from app.core.config import settings
from app.core.security import create_access_token
from app.core.seed import seed_database
from app.models.domain import User, Skill, SkillEdge, UserSkillProficiency
from app.main import app


# ============================================================================
# Test Fixtures
# ============================================================================

@pytest.fixture(scope="function")
def test_db():
    """Isolated in-memory SQLite database session per test with StaticPool."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    
    seed_database(db)
    
    yield db
    
    db.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(test_db):
    """FastAPI TestClient with overridden database dependency."""
    def override_get_db():
        try:
            yield test_db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def create_minimal_flate_pdf(text: str) -> bytes:
    """
    Generates a valid, minimal PDF 1.4 binary payload with a FlateDecode (zlib-compressed) stream.
    """
    # Stream content in standard PDF text formatting
    stream_content = f"BT /F1 12 Tf 72 712 Td ({text}) Tj ET\n".encode("latin-1")
    compressed_stream = zlib.compress(stream_content)
    stream_len = len(compressed_stream)

    header = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
    pages_obj = b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
    page_obj = b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n"
    stream_obj = (
        f"4 0 obj\n<< /Length {stream_len} /Filter /FlateDecode >>\nstream\n".encode("latin-1")
        + compressed_stream
        + b"\nendstream\nendobj\n"
    )
    font_obj = b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
    trailer = b"xref\n0 6\n0000000000 65535 f \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n999\n%%EOF\n"

    return header + pages_obj + page_obj + stream_obj + font_obj + trailer


# ============================================================================
# 1. Auth Enforcement Tests (F2)
# ============================================================================

def test_forged_bearer_token_returns_401_unauthorized(client):
    """
    SECURITY INVARIANT: Any invalid, tampered, or forged Bearer token MUST return HTTP 401 Unauthorized.
    It must never fall back to the demo candidate account.
    """
    response = client.get("/api/users/me", headers={"Authorization": "Bearer totally.fake.forged_token_here"})
    assert response.status_code == 401, f"Expected 401 Unauthorized on forged token, got {response.status_code}"
    assert "Token is invalid or expired" in response.json()["detail"]


def test_malformed_authorization_header_returns_401(client):
    """
    SECURITY INVARIANT: Non-Bearer Authorization headers return HTTP 401 Unauthorized.
    """
    response = client.get("/api/users/me", headers={"Authorization": "Basic dXNlcjpwYXNz"})
    assert response.status_code == 401
    assert "Malformed Authorization header" in response.json()["detail"]


def test_valid_token_authenticates_correct_user(client, test_db):
    """
    INVARIANT: A cryptographically signed valid token authenticates only the corresponding user.
    """
    # Create test user
    user = User(id="usr_victim_99", email="victim@security.dev", name="Victim User")
    test_db.add(user)
    test_db.commit()

    token = create_access_token(subject=user.id)
    response = client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "usr_victim_99"
    assert data["email"] == "victim@security.dev"


def test_missing_token_in_production_returns_401(client, monkeypatch):
    """
    INVARIANT: Unauthenticated requests in production return 401 (no demo fallback).
    """
    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    response = client.get("/api/users/me")
    assert response.status_code == 401
    assert "Not authenticated" in response.json()["detail"]


# ============================================================================
# 2. Flate-Compressed PDF Parsing & Ingestion (F1)
# ============================================================================

def test_flate_compressed_pdf_ingestion(client):
    """
    INVARIANT: Real compressed PDF files (FlateDecode) are successfully decompressed and parsed.
    """
    pdf_bytes = create_minimal_flate_pdf("Expert Python and advanced Docker and Kubernetes architecture.")
    
    files = {
        "file": ("resume.pdf", pdf_bytes, "application/pdf")
    }
    
    response = client.post("/api/users/resume", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["matched_count"] >= 3
    assert "Python" in data["extracted_skills"]
    assert "Docker" in data["extracted_skills"]
    assert "Kubernetes" in data["extracted_skills"]


def test_zero_match_resume_returns_failure_signal(client):
    """
    INVARIANT: Uploading a document with no recognized skills returns success=False and matched_count=0.
    """
    pdf_bytes = create_minimal_flate_pdf("History and cooking recipes about pasta and astronomy with no tech.")
    
    files = {
        "file": ("non_tech.pdf", pdf_bytes, "application/pdf")
    }
    
    response = client.post("/api/users/resume", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["matched_count"] == 0
    assert "No recognized technical skills found" in data["message"]
    assert data["unlocked_skills"] == []


# ============================================================================
# 3. Dynamic unlocked_skills Computation (F5)
# ============================================================================

def test_resume_upload_populates_unlocked_skills(client, test_db):
    """
    INVARIANT: Ingesting prerequisites (Linux + FastAPI) unlocks Docker and reports it in unlocked_skills.
    """
    # Create candidate with 0 skills
    user = User(id="usr_fresh_candidate", email="fresh@skillgap.dev", name="Fresh Candidate")
    test_db.add(user)
    test_db.commit()

    token = create_access_token(subject=user.id)
    
    # Resume contains Linux and FastAPI (the two prerequisites for Docker)
    resume_text = "Experienced Senior Software Engineer proficient in Linux, Bash, and FastAPI web development."
    resume_bytes = create_minimal_flate_pdf(resume_text)

    files = {
        "file": ("resume.pdf", resume_bytes, "application/pdf")
    }
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post("/api/users/resume", files=files, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "Linux & Bash" in data["extracted_skills"] or "FastAPI" in data["extracted_skills"]
    assert "Docker" in data["unlocked_skills"], f"Docker should be unlocked! Got: {data['unlocked_skills']}"


# ============================================================================
# 4. DAG Skill Graph Endpoint (F4 & Suggestions)
# ============================================================================

def test_get_skill_graph_endpoint(client):
    """
    INVARIANT: GET /api/skills/graph returns all 24 DAG nodes, directed edges, and topological depth.
    """
    response = client.get("/api/skills/graph")
    assert response.status_code == 200
    data = response.json()
    
    assert "nodes" in data
    assert "edges" in data
    assert data["total_nodes"] >= 20
    assert data["total_edges"] >= 20
    
    # Verify node structure
    docker_node = next((n for n in data["nodes"] if n["normalized_key"] == "docker"), None)
    assert docker_node is not None
    assert "Linux & Bash" in docker_node["unlocked_by"]
    assert "FastAPI" in docker_node["unlocked_by"]
    assert "Kubernetes" in docker_node["unlocks"]
    assert docker_node["topological_depth"] >= 1
