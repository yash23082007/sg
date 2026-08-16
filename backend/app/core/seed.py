"""
SkillGap Database Seeder
Seeds 24+ technical skill nodes, 29+ DAG prerequisite edges, and baseline candidate proficiencies.
"""

from sqlalchemy.orm import Session
from app.models.domain import User, Skill, SkillEdge, UserSkillProficiency
from app.core.security import hash_password
from app.core.database import SessionLocal, engine, Base


def seed_database(db: Session = None):
    """Idempotently seeds canonical skills, DAG edges, and default candidate proficiencies."""
    owns_session = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        owns_session = True

    try:
        # 1. Canonical Skill Nodes (24 nodes across 7 domains)
        skills_data = [
            # Fundamentals / Languages
            {"key": "python", "name": "Python", "category": "language", "demand": 0.95, "req": 0.90, "hours": 20, "desc": "Async/await, typing, generators, context managers, and metaclasses."},
            {"key": "typescript", "name": "TypeScript", "category": "language", "demand": 0.90, "req": 0.85, "hours": 20, "desc": "Generics, conditional types, utility types, and strict AST compiler options."},
            {"key": "linux", "name": "Linux & Bash", "category": "tooling", "demand": 0.85, "req": 0.80, "hours": 15, "desc": "Process management, POSIX signals, permissions, and shell scripting."},
            {"key": "git", "name": "Git Architecture", "category": "tooling", "demand": 0.88, "req": 0.85, "hours": 10, "desc": "Branching strategies, rebase workflows, submodules, and merge conflict resolution."},
            {"key": "sql", "name": "SQL & Relational Theory", "category": "database", "demand": 0.92, "req": 0.85, "hours": 20, "desc": "Normalization, indexing strategies, join algorithms, and execution plans."},
            
            # Frameworks & Backend
            {"key": "fastapi", "name": "FastAPI", "category": "framework", "demand": 0.86, "req": 0.80, "hours": 25, "desc": "Asynchronous request lifecycle, dependencies, middleware, and OpenAPI generation."},
            {"key": "nextjs", "name": "Next.js", "category": "framework", "demand": 0.88, "req": 0.85, "hours": 25, "desc": "App Router, Server Components (RSC), SSR caching, and streaming architecture."},
            {"key": "react", "name": "React", "category": "framework", "demand": 0.92, "req": 0.85, "hours": 30, "desc": "Hooks, concurrent mode, reconciliation, and state machines."},
            {"key": "sqlalchemy", "name": "SQLAlchemy & ORM", "category": "database", "demand": 0.82, "req": 0.80, "hours": 20, "desc": "Declarative mapping, unit of work pattern, eager/lazy loading, and migrations."},
            {"key": "postgresql", "name": "PostgreSQL Internals", "category": "database", "demand": 0.90, "req": 0.85, "hours": 25, "desc": "MVCC, WAL, connection pooling (PgBouncer), partitioning, and EXPLAIN ANALYZE."},
            
            # DevOps & Infrastructure
            {"key": "docker", "name": "Docker", "category": "devops", "demand": 0.92, "req": 0.80, "hours": 20, "desc": "Multi-stage builds, container isolation, cgroups, bridge networking, and compose."},
            {"key": "kubernetes", "name": "Kubernetes", "category": "devops", "demand": 0.88, "req": 0.75, "hours": 40, "desc": "Pod scheduling, ingress controllers, ConfigMaps/Secrets, CRDs, and Helm charts."},
            {"key": "cicd", "name": "CI/CD Pipelines", "category": "devops", "demand": 0.84, "req": 0.75, "hours": 15, "desc": "Automated linting, matrix test builds, artifact registries, and rollback strategies."},
            
            # Architecture & Distributed Systems
            {"key": "system_design", "name": "System Design", "category": "architecture", "demand": 0.94, "req": 0.85, "hours": 35, "desc": "Distributed caching, rate limiting, CAP theorem trade-offs, and microservices."},
            {"key": "redis", "name": "Redis & In-Memory Caching", "category": "database", "demand": 0.85, "req": 0.75, "hours": 15, "desc": "Cache-aside patterns, Pub/Sub, sorted sets, eviction policies, and cluster mode."},
            {"key": "graphql", "name": "GraphQL", "category": "framework", "demand": 0.75, "req": 0.70, "hours": 15, "desc": "Schema definition language, resolvers, dataloader N+1 mitigation, and subscriptions."},
            {"key": "rest_apis", "name": "REST API Design", "category": "architecture", "demand": 0.90, "req": 0.85, "hours": 10, "desc": "HTTP status semantics, idempotent mutations, pagination, and HATEOAS."},
            
            # AI / ML & LLM Engineering
            {"key": "ml_foundations", "name": "Machine Learning Foundations", "category": "ai_ml", "demand": 0.85, "req": 0.75, "hours": 30, "desc": "Linear algebra, matrix operations, embeddings, loss functions, and evaluation metrics."},
            {"key": "langchain", "name": "LangChain & Agentic AI", "category": "ai_ml", "demand": 0.93, "req": 0.80, "hours": 35, "desc": "Tool calling, memory management, multi-agent state machines, and LCEL chains."},
            {"key": "vectordb", "name": "Vector Databases & RAG", "category": "ai_ml", "demand": 0.91, "req": 0.80, "hours": 25, "desc": "HNSW indexing, cosine similarity, chunking strategies, and hybrid semantic search."},
            {"key": "prompt_eng", "name": "Prompt Engineering & Evals", "category": "ai_ml", "demand": 0.88, "req": 0.80, "hours": 15, "desc": "Few-shot prompting, structured JSON schema outputs, and automated LLM judge evals."},
            {"key": "tailwind", "name": "Tailwind CSS", "category": "framework", "demand": 0.82, "req": 0.80, "hours": 10, "desc": "Utility-first design tokens, responsive layouts, CSS variables, and modern grids."},
            {"key": "microservices", "name": "Microservices Architecture", "category": "architecture", "demand": 0.86, "req": 0.80, "hours": 25, "desc": "Service mesh, distributed tracing, circuit breakers, and event-driven patterns."},
            {"key": "event_driven", "name": "Event-Driven Architecture", "category": "architecture", "demand": 0.84, "req": 0.75, "hours": 25, "desc": "Message queues (Kafka/RabbitMQ), event sourcing, CQRS, and at-least-once delivery."},
        ]

        skill_map = {}
        for s in skills_data:
            existing = db.query(Skill).filter(Skill.normalized_key == s["key"]).first()
            if not existing:
                skill_obj = Skill(
                    name=s["name"],
                    normalized_key=s["key"],
                    category=s["category"],
                    demand_score=s["demand"],
                    required_proficiency=s["req"],
                    estimated_hours=s["hours"],
                    description=s["desc"],
                )
                db.add(skill_obj)
                db.flush()
                skill_map[s["key"]] = skill_obj
            else:
                skill_map[s["key"]] = existing

        # 2. Canonical DAG Prerequisite Edges (29 Prerequisite Relationships)
        # prerequisite_key -> dependent_key
        edges_data = [
            ("python", "fastapi"),
            ("python", "sqlalchemy"),
            ("python", "ml_foundations"),
            ("typescript", "react"),
            ("react", "nextjs"),
            ("typescript", "nextjs"),
            ("tailwind", "nextjs"),
            ("sql", "postgresql"),
            ("sql", "sqlalchemy"),
            ("postgresql", "sqlalchemy"),
            ("linux", "docker"),
            ("fastapi", "docker"),
            ("docker", "kubernetes"),
            ("docker", "cicd"),
            ("git", "cicd"),
            ("fastapi", "rest_apis"),
            ("rest_apis", "graphql"),
            ("fastapi", "microservices"),
            ("docker", "microservices"),
            ("microservices", "system_design"),
            ("redis", "system_design"),
            ("postgresql", "system_design"),
            ("event_driven", "system_design"),
            ("ml_foundations", "langchain"),
            ("python", "langchain"),
            ("prompt_eng", "langchain"),
            ("langchain", "vectordb"),
            ("fastapi", "redis"),
            ("kubernetes", "microservices"),
        ]

        for prereq_key, dep_key in edges_data:
            if prereq_key in skill_map and dep_key in skill_map:
                prereq = skill_map[prereq_key]
                dep = skill_map[dep_key]
                existing_edge = db.query(SkillEdge).filter(
                    SkillEdge.prerequisite_id == prereq.id,
                    SkillEdge.dependent_id == dep.id
                ).first()
                if not existing_edge:
                    edge = SkillEdge(prerequisite_id=prereq.id, dependent_id=dep.id)
                    db.add(edge)

        db.flush()

        # 3. Compute and cache Centrality (V = Transitive downstream count normalized)
        # Compute adjacency for all nodes
        all_skills = db.query(Skill).all()
        all_edges = db.query(SkillEdge).all()
        
        adj = {s.id: set() for s in all_skills}
        for e in all_edges:
            if e.prerequisite_id in adj:
                adj[e.prerequisite_id].add(e.dependent_id)

        # Transitive closure count using BFS/DFS
        for s in all_skills:
            visited = set()
            stack = list(adj[s.id])
            while stack:
                curr = stack.pop()
                if curr not in visited:
                    visited.add(curr)
                    stack.extend(adj.get(curr, set()))
            # Normalize centrality (0.0 to 1.0 based on maximum reachable count)
            s.centrality = round(len(visited) / max(1, len(all_skills) - 1), 3)

        # 4. Seed Default Candidate User & Proficiencies
        demo_user = db.query(User).filter(User.email == "staff.engineer@skillgap.dev").first()
        if not demo_user:
            demo_user = User(
                id="usr_prod_001",
                email="staff.engineer@skillgap.dev",
                name="Staff Engineer",
                hashed_password=hash_password("skillgap123"),
                target_role="Full Stack AI Engineer",
                resume_uploaded=True,
            )
            db.add(demo_user)
            db.flush()

        # Baseline proficiencies for Candidate
        baseline_proficiencies = {
            "python": 0.88,
            "typescript": 0.82,
            "linux": 0.75,
            "git": 0.85,
            "sql": 0.80,
            "fastapi": 0.65,
            "nextjs": 0.72,
            "react": 0.84,
            "graphql": 0.78,
            "tailwind": 0.88,
            "rest_apis": 0.85,
            "postgresql": 0.55,
            "docker": 0.30,
            "cicd": 0.50,
            "redis": 0.40,
            "system_design": 0.45,
            "ml_foundations": 0.50,
            "prompt_eng": 0.60,
            "langchain": 0.20,
            "vectordb": 0.15,
            "kubernetes": 0.10,
        }

        for key, prof_val in baseline_proficiencies.items():
            if key in skill_map:
                sk = skill_map[key]
                existing_prof = db.query(UserSkillProficiency).filter(
                    UserSkillProficiency.user_id == demo_user.id,
                    UserSkillProficiency.skill_id == sk.id
                ).first()
                if not existing_prof:
                    db.add(UserSkillProficiency(
                        user_id=demo_user.id,
                        skill_id=sk.id,
                        proficiency=prof_val,
                        source="resume"
                    ))
                else:
                    existing_prof.proficiency = prof_val

        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        if owns_session:
            db.close()


if __name__ == "__main__":
    seed_database()
    print("Database seeded with 24 skills, 29 edges, and candidate proficiencies.")
