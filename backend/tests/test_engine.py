"""
SkillGap Comprehensive Engine & DAG Property Test Suite
Asserts graph invariants, topological validity, readiness gate short-circuiting,
Priority Score mathematical consistency, cycle prevention, and NLP normalization.
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException

from app.core.database import Base
from app.core.config import settings
from app.models.domain import User, Skill, SkillEdge, UserSkillProficiency
from app.core.seed import seed_database
from app.services.graph import GraphService
from app.services.nlp import NLPService


@pytest.fixture(scope="function")
def test_db():
    """In-memory SQLite database session isolated per test function."""
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    
    # Populate canonical seed data
    seed_database(db)
    
    yield db
    
    db.close()
    Base.metadata.drop_all(bind=engine)


# ============================================================================
# 1. Topological Sorting & Roadmap Invariants
# ============================================================================

def test_topological_roadmap_ordering_respects_prerequisites(test_db):
    """
    INVARIANT: In the generated roadmap, no skill may ever appear before any of its prerequisites.
    """
    roadmap = GraphService.get_roadmap(user_id="usr_prod_001", db=test_db)
    assert len(roadmap) >= 20, "Roadmap should contain all reachable skills in the DAG"

    # Map skill name to its sequential order index (1-based)
    order_map = {step.skill_name: step.order for step in roadmap}

    # Verify prerequisite ordering constraints
    all_edges = test_db.query(SkillEdge).all()
    skill_by_id = {s.id: s for s in test_db.query(Skill).all()}

    for edge in all_edges:
        prereq_name = skill_by_id[edge.prerequisite_id].name
        dep_name = skill_by_id[edge.dependent_id].name

        if prereq_name in order_map and dep_name in order_map:
            assert order_map[prereq_name] < order_map[dep_name], (
                f"Topological violation: Prerequisite '{prereq_name}' (step {order_map[prereq_name]}) "
                f"appears after dependent '{dep_name}' (step {order_map[dep_name]})"
            )


# ============================================================================
# 2. Cycle Detection & Acyclicity Invariants
# ============================================================================

def test_cycle_detection_rejects_circular_dependencies(test_db):
    """
    INVARIANT: Attempting to insert a back-edge that forms a directed cycle raises 409 Conflict.
    """
    # Find Python and FastAPI
    python_skill = test_db.query(Skill).filter(Skill.normalized_key == "python").first()
    fastapi_skill = test_db.query(Skill).filter(Skill.normalized_key == "fastapi").first()

    assert python_skill is not None and fastapi_skill is not None

    # Python -> FastAPI already exists. Adding FastAPI -> Python creates a 2-node cycle.
    with pytest.raises(HTTPException) as exc_info:
        GraphService.assert_acyclic(
            db=test_db,
            proposed_prereq_id=fastapi_skill.id,
            proposed_dep_id=python_skill.id
        )

    assert exc_info.value.status_code == 409
    assert "Cycle detected" in exc_info.value.detail


def test_self_referential_edge_rejected(test_db):
    """
    INVARIANT: A skill cannot be its own prerequisite.
    """
    python_skill = test_db.query(Skill).filter(Skill.normalized_key == "python").first()
    with pytest.raises(HTTPException) as exc_info:
        GraphService.assert_acyclic(
            db=test_db,
            proposed_prereq_id=python_skill.id,
            proposed_dep_id=python_skill.id
        )
    assert exc_info.value.status_code == 409


# ============================================================================
# 3. Readiness Gate (R) & Mathematical Score Consistency
# ============================================================================

def test_readiness_gate_short_circuits_to_zero(test_db):
    """
    INVARIANT: If ANY upstream prerequisite is unmet, R = 0 and priority_score MUST be exactly 0.0.
    """
    # Create a fresh candidate with zero proficiencies
    user = User(id="usr_test_zero", email="zero@test.com", name="Zero Candidate")
    test_db.add(user)
    test_db.commit()

    dashboard = GraphService.get_dashboard_analysis(user_id=user.id, db=test_db)
    
    # Find gated downstream skills like Kubernetes (which requires Docker & CI/CD)
    k8s_item = next((item for item in dashboard.skill_gaps if item.skill_name == "Kubernetes"), None)
    assert k8s_item is not None
    assert k8s_item.readiness_gate is False, "Kubernetes must be gated when prerequisites are at 0%"
    assert k8s_item.priority_score == 0.0, f"Gated skill must have priority_score=0.0, got {k8s_item.priority_score}"


def test_priority_score_arithmetic_consistency(test_db):
    """
    PROPERTY TEST: For every returned skill, recomputing P from D, G, V, R matches the returned P.
    """
    dashboard = GraphService.get_dashboard_analysis(user_id="usr_prod_001", db=test_db)
    skills_map = {s.id: s for s in test_db.query(Skill).all()}

    for item in dashboard.skill_gaps:
        skill = skills_map[item.skill_id]
        
        # Recompute independently using the formula
        raw_gap = max(0.0, skill.required_proficiency - (item.current_proficiency / 100.0))
        recomputed_p = GraphService.calculate_priority_score(
            demand=skill.demand_score,
            gap=raw_gap,
            centrality=skill.centrality,
            readiness_gate=item.readiness_gate,
            wd=settings.WEIGHT_DEMAND,
            wg=settings.WEIGHT_GAP,
            wv=settings.WEIGHT_VALUE,
        )

        assert abs(recomputed_p - item.priority_score) < 0.01, (
            f"Arithmetic inconsistency on '{item.skill_name}': "
            f"Returned P={item.priority_score}, Recomputed P={recomputed_p} "
            f"(D={skill.demand_score}, Gap={raw_gap}, V={skill.centrality}, R={item.readiness_gate})"
        )


def test_learning_prerequisite_flips_readiness_gate(test_db):
    """
    END-TO-END TEST: Ingesting/mastering a prerequisite (Linux + FastAPI) unlocks Docker (R=0 -> R=1).
    """
    # Create candidate with only Linux and FastAPI
    user = User(id="usr_test_transition", email="trans@test.com", name="Transition Candidate")
    test_db.add(user)
    test_db.flush()

    linux_skill = test_db.query(Skill).filter(Skill.normalized_key == "linux").first()
    fastapi_skill = test_db.query(Skill).filter(Skill.normalized_key == "fastapi").first()
    docker_skill = test_db.query(Skill).filter(Skill.normalized_key == "docker").first()

    # Step 1: Zero proficiencies -> Docker is gated
    dashboard_1 = GraphService.get_dashboard_analysis(user_id=user.id, db=test_db)
    docker_1 = next(item for item in dashboard_1.skill_gaps if item.skill_id == docker_skill.id)
    assert docker_1.readiness_gate is False
    assert docker_1.priority_score == 0.0

    # Step 2: Grant Linux=0.85 and FastAPI=0.85 (prerequisites for Docker)
    test_db.add(UserSkillProficiency(user_id=user.id, skill_id=linux_skill.id, proficiency=0.85))
    test_db.add(UserSkillProficiency(user_id=user.id, skill_id=fastapi_skill.id, proficiency=0.85))
    test_db.commit()

    # Step 3: Docker gate is now unlocked (R=1) and P > 0
    dashboard_2 = GraphService.get_dashboard_analysis(user_id=user.id, db=test_db)
    docker_2 = next(item for item in dashboard_2.skill_gaps if item.skill_id == docker_skill.id)
    assert docker_2.readiness_gate is True, "Docker must be unlocked after clearing Linux and FastAPI"
    assert docker_2.priority_score > 0.40, f"Docker should now have a high priority score, got {docker_2.priority_score}"


# ============================================================================
# 4. NLP Token Normalization & Alias Collapsing
# ============================================================================

def test_nlp_alias_collapsing(test_db):
    """
    INVARIANT: Aliases like 'ReactJS', 'React.js', 'k8s', 'pg' collapse strictly to canonical tokens.
    """
    sample_resume = (
        "Senior Staff Architect with 8+ years of production experience in ReactJS, React.js, "
        "k8s cluster administration, pg database optimization, and FastAPI microservices."
    )

    response = NLPService.parse_and_normalize_resume(
        file_bytes=sample_resume.encode("utf-8"),
        filename="resume.txt",
        user_id="usr_prod_001",
        db=test_db,
    )

    assert response.success is True
    assert "React" in response.extracted_skills
    assert "Kubernetes" in response.extracted_skills
    assert "PostgreSQL Internals" in response.extracted_skills
    assert "FastAPI" in response.extracted_skills
