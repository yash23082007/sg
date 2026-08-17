"""
SkillGap Graph DAG & Recommendation Service
Executes topological sort (Kahn's algorithm), cycle detection, prerequisite gate verification,
and deterministic priority score calculations over live SQLAlchemy database records.
"""

from typing import List, Dict, Set, Tuple, Optional
from collections import deque, defaultdict
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.domain import Skill, SkillEdge, UserSkillProficiency, User
from app.schemas.payload import (
    DashboardResponse,
    SkillGapItem,
    RoadmapStepResponse,
    SkillGraphResponse,
    SkillGraphNode,
    SkillGraphEdge,
)
from app.core.config import settings


class GraphService:
    """Directed Acyclic Graph (DAG) computational service for career architecture."""

    @staticmethod
    def calculate_priority_score(
        demand: float,
        gap: float,
        centrality: float,
        readiness_gate: bool,
        wd: float = settings.WEIGHT_DEMAND,
        wg: float = settings.WEIGHT_GAP,
        wv: float = settings.WEIGHT_VALUE,
    ) -> float:
        """
        Calculates the Priority Score P:
        P = ((D * Wd) + (G * Wg) + (V * Wv)) * R
        
        Where:
        - D (Demand): Normalized market demand frequency (0.0 - 1.0)
        - G (Gap): Normalized required proficiency minus current proficiency (0.0 - 1.0)
        - V (Value): Centrality / transitive descendant ratio (0.0 - 1.0)
        - R (Readiness): Strict Boolean gate (1.0 if all prerequisites cleared, 0.0 otherwise)
        """
        if not readiness_gate:
            return 0.0

        clamped_gap = max(0.0, min(1.0, gap))
        score = (demand * wd) + (clamped_gap * wg) + (centrality * wv)
        return round(min(1.0, max(0.0, score)), 2)

    @classmethod
    def assert_acyclic(cls, db: Session, proposed_prereq_id: str, proposed_dep_id: str) -> None:
        """
        Runs Kahn's algorithm cycle detection on the graph with the proposed edge included.
        Raises HTTP 409 Conflict if adding the edge would introduce a directed cycle.
        """
        if proposed_prereq_id == proposed_dep_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cycle detected: Self-referential prerequisite loops are forbidden."
            )

        edges = db.query(SkillEdge).all()
        skills = db.query(Skill).all()

        adj: Dict[str, Set[str]] = {s.id: set() for s in skills}
        in_degree: Dict[str, int] = {s.id: 0 for s in skills}

        # Build existing graph
        for e in edges:
            if e.prerequisite_id in adj and e.dependent_id in adj:
                adj[e.prerequisite_id].add(e.dependent_id)
                in_degree[e.dependent_id] += 1

        # Add proposed edge
        if proposed_prereq_id in adj and proposed_dep_id in adj:
            if proposed_dep_id not in adj[proposed_prereq_id]:
                adj[proposed_prereq_id].add(proposed_dep_id)
                in_degree[proposed_dep_id] += 1

        # Kahn's Algorithm
        queue = deque([node_id for node_id, deg in in_degree.items() if deg == 0])
        visited_count = 0

        while queue:
            curr = queue.popleft()
            visited_count += 1
            for neighbor in adj[curr]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        if visited_count < len(skills):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cycle detected: Inserting this prerequisite edge creates an illegal circular dependency in the DAG."
            )

    @classmethod
    def compute_centrality_for_all_skills(cls, db: Session) -> None:
        """
        Computes the normalized transitive descendant count (V) for all skills and updates the database.
        """
        skills = db.query(Skill).all()
        edges = db.query(SkillEdge).all()

        adj: Dict[str, Set[str]] = {s.id: set() for s in skills}
        for e in edges:
            if e.prerequisite_id in adj:
                adj[e.prerequisite_id].add(e.dependent_id)

        max_possible = max(1, len(skills) - 1)
        for s in skills:
            visited = set()
            stack = list(adj[s.id])
            while stack:
                curr = stack.pop()
                if curr not in visited:
                    visited.add(curr)
                    stack.extend(adj.get(curr, set()))
            s.centrality = round(len(visited) / max_possible, 3)

        db.commit()

    @classmethod
    def get_dashboard_analysis(cls, user_id: str, db: Session) -> DashboardResponse:
        """
        Live computation of candidate skill gap matrix, prerequisite gates, and overall readiness.
        Queries live database rows for skills, prerequisite edges, and user proficiencies.
        """
        # Fetch all skills and prerequisite edges
        skills = db.query(Skill).all()
        if not skills:
            from app.core.seed import seed_database
            seed_database(db)
            skills = db.query(Skill).all()

        edges = db.query(SkillEdge).all()
        user_profs = db.query(UserSkillProficiency).filter(UserSkillProficiency.user_id == user_id).all()
        prof_map: Dict[str, float] = {p.skill_id: p.proficiency for p in user_profs}

        # Build prerequisite mapping: dependent_id -> list of prerequisite Skills
        skill_by_id: Dict[str, Skill] = {s.id: s for s in skills}
        prereqs_by_dep: Dict[str, List[Skill]] = defaultdict(list)
        for e in edges:
            if e.prerequisite_id in skill_by_id:
                prereqs_by_dep[e.dependent_id].append(skill_by_id[e.prerequisite_id])

        gap_items: List[SkillGapItem] = []
        mastered_count = 0
        critical_count = 0
        total_curr_prof = 0.0

        for skill in skills:
            curr_prof = prof_map.get(skill.id, 0.0)
            req_prof = skill.required_proficiency
            total_curr_prof += curr_prof

            # Evaluate Prerequisite Gate (R)
            # R = 1 iff all upstream prerequisites have proficiency >= PREREQUISITE_PASS_THRESHOLD
            unmet_prereqs = []
            readiness_gate = True
            for prereq in prereqs_by_dep.get(skill.id, []):
                prereq_prof = prof_map.get(prereq.id, 0.0)
                if prereq_prof < settings.PREREQUISITE_PASS_THRESHOLD:
                    readiness_gate = False
                    unmet_prereqs.append(prereq.name)

            # Mathematical gap delta (0.0 to 1.0)
            raw_gap = max(0.0, req_prof - curr_prof)
            gap_pct = int(round((req_prof - curr_prof) * 100))

            # Deterministic priority score P
            priority_score = cls.calculate_priority_score(
                demand=skill.demand_score,
                gap=raw_gap,
                centrality=skill.centrality,
                readiness_gate=readiness_gate,
            )

            # Determine status label
            if curr_prof >= 0.80:
                status_label = "mastered"
                mastered_count += 1
            elif curr_prof >= 0.60:
                status_label = "proficient"
            elif curr_prof >= 0.40:
                status_label = "developing"
            else:
                status_label = "critical"
                if gap_pct > 30:
                    critical_count += 1

            gap_items.append(SkillGapItem(
                skill_id=skill.id,
                skill_name=skill.name,
                category=skill.category,
                current_proficiency=int(round(curr_prof * 100)),
                required_proficiency=int(round(req_prof * 100)),
                gap=gap_pct,
                priority_score=priority_score,
                status=status_label,
                readiness_gate=readiness_gate,
                unmet_prerequisites=unmet_prereqs,
            ))

        # Sort skill gaps by Priority Score descending (highest actionable leverage first)
        # For items with equal P (e.g. 0.0 gated items), sort by demand and gap
        gap_items.sort(key=lambda item: (item.priority_score, item.gap), reverse=True)

        avg_prof = int(round((total_curr_prof / max(1, len(skills))) * 100))
        
        # Overall readiness weighted by target role required benchmarks
        total_req = sum(s.required_proficiency for s in skills)
        overall_readiness = int(round((total_curr_prof / max(0.01, total_req)) * 100))
        overall_readiness = min(100, max(0, overall_readiness))

        return DashboardResponse(
            overall_readiness=overall_readiness,
            total_skills=len(skills),
            mastered_count=mastered_count,
            critical_count=critical_count,
            average_proficiency=avg_prof,
            skill_gaps=gap_items,
            telemetry_source="live_dag_engine",
        )

    @classmethod
    def get_roadmap(cls, user_id: str, db: Session) -> List[RoadmapStepResponse]:
        """
        Generates a topological roadmap via Kahn's algorithm, ordering unmastered skills
        strictly according to prerequisite depth and Priority Score leverage.
        """
        skills = db.query(Skill).all()
        if not skills:
            from app.core.seed import seed_database
            seed_database(db)
            skills = db.query(Skill).all()

        edges = db.query(SkillEdge).all()
        user_profs = db.query(UserSkillProficiency).filter(UserSkillProficiency.user_id == user_id).all()
        prof_map: Dict[str, float] = {p.skill_id: p.proficiency for p in user_profs}
        skill_by_id: Dict[str, Skill] = {s.id: s for s in skills}

        # Build graph structures
        adj: Dict[str, Set[str]] = {s.id: set() for s in skills}
        in_degree: Dict[str, int] = {s.id: 0 for s in skills}
        prereqs_names_by_dep: Dict[str, List[str]] = defaultdict(list)

        for e in edges:
            if e.prerequisite_id in adj and e.dependent_id in adj:
                adj[e.prerequisite_id].add(e.dependent_id)
                in_degree[e.dependent_id] += 1
                prereqs_names_by_dep[e.dependent_id].append(skill_by_id[e.prerequisite_id].name)

        # Kahn's Algorithm topological ordering
        queue = deque([node_id for node_id, deg in in_degree.items() if deg == 0])
        topo_order: List[str] = []

        while queue:
            curr = queue.popleft()
            topo_order.append(curr)
            for neighbor in sorted(adj[curr], key=lambda nid: skill_by_id[nid].demand_score, reverse=True):
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        # Build Roadmap Steps from Topological Ordering
        steps: List[RoadmapStepResponse] = []
        step_index = 1

        for skill_id in topo_order:
            skill = skill_by_id[skill_id]
            curr_prof = prof_map.get(skill.id, 0.0)

            # Determine stage status
            if curr_prof >= 0.80:
                step_status = "completed"
            elif curr_prof >= 0.50:
                step_status = "current"
            else:
                # Check if all prerequisites are completed
                all_prereqs_cleared = True
                for prereq_edge in skill.prerequisites:
                    if prof_map.get(prereq_edge.prerequisite_id, 0.0) < settings.PREREQUISITE_PASS_THRESHOLD:
                        all_prereqs_cleared = False
                        break
                step_status = "current" if all_prereqs_cleared else "locked"

            steps.append(RoadmapStepResponse(
                id=f"step-{skill.normalized_key}",
                order=step_index,
                skill_name=skill.name,
                skill_id=skill.id,
                category=skill.category,
                description=skill.description or f"Master foundational and advanced {skill.name} architecture.",
                estimated_hours=int(skill.estimated_hours),
                prerequisites=prereqs_names_by_dep.get(skill.id, []),
                status=step_status,
            ))
            step_index += 1

        return steps

    @classmethod
    def get_graph_topology(cls, user_id: str, db: Session) -> SkillGraphResponse:
        """
        Builds complete DAG topology for visualization: all nodes with verified proficiency,
        status, upstream prerequisites, downstream unlocks, topological depth, and directed edges.
        """
        skills = db.query(Skill).all()
        if not skills:
            from app.core.seed import seed_database
            seed_database(db)
            skills = db.query(Skill).all()

        edges = db.query(SkillEdge).all()
        user_profs = db.query(UserSkillProficiency).filter(UserSkillProficiency.user_id == user_id).all()
        prof_map: Dict[str, float] = {p.skill_id: p.proficiency for p in user_profs}
        skill_by_id: Dict[str, Skill] = {s.id: s for s in skills}

        # Build adjacency maps
        adj_downstream: Dict[str, List[Skill]] = defaultdict(list)
        adj_upstream: Dict[str, List[Skill]] = defaultdict(list)
        in_degree: Dict[str, int] = {s.id: 0 for s in skills}

        for e in edges:
            if e.prerequisite_id in skill_by_id and e.dependent_id in skill_by_id:
                adj_downstream[e.prerequisite_id].append(skill_by_id[e.dependent_id])
                adj_upstream[e.dependent_id].append(skill_by_id[e.prerequisite_id])
                in_degree[e.dependent_id] += 1

        # Compute topological depth (longest path from root nodes)
        queue = deque([s.id for s in skills if in_degree[s.id] == 0])
        depth_map: Dict[str, int] = {s.id: 0 for s in skills if in_degree[s.id] == 0}
        temp_in_degree = in_degree.copy()

        while queue:
            curr_id = queue.popleft()
            curr_depth = depth_map.get(curr_id, 0)
            for child in adj_downstream.get(curr_id, []):
                depth_map[child.id] = max(depth_map.get(child.id, 0), curr_depth + 1)
                temp_in_degree[child.id] -= 1
                if temp_in_degree[child.id] == 0:
                    queue.append(child.id)

        nodes: List[SkillGraphNode] = []
        for s in skills:
            curr_prof = prof_map.get(s.id, 0.0)
            req_prof = s.required_proficiency

            # Evaluate Prerequisite Gate
            readiness_gate = True
            unlocked_by_names = []
            for prereq in adj_upstream.get(s.id, []):
                unlocked_by_names.append(prereq.name)
                if prof_map.get(prereq.id, 0.0) < settings.PREREQUISITE_PASS_THRESHOLD:
                    readiness_gate = False

            unlocks_names = [dep.name for dep in adj_downstream.get(s.id, [])]

            if curr_prof >= 0.80:
                node_status = "mastered"
            elif readiness_gate:
                node_status = "current"
            else:
                node_status = "locked"

            nodes.append(SkillGraphNode(
                id=s.normalized_key,
                name=s.name,
                normalized_key=s.normalized_key,
                category=s.category,
                level=int(round(curr_prof * 100)),
                required_level=int(round(req_prof * 100)),
                status=node_status,
                demand_score=s.demand_score,
                centrality=s.centrality,
                readiness_gate=readiness_gate,
                unlocked_by=unlocked_by_names,
                unlocks=unlocks_names,
                topological_depth=depth_map.get(s.id, 0),
            ))

        graph_edges: List[SkillGraphEdge] = []
        for e in edges:
            if e.prerequisite_id in skill_by_id and e.dependent_id in skill_by_id:
                p = skill_by_id[e.prerequisite_id]
                d = skill_by_id[e.dependent_id]
                graph_edges.append(SkillGraphEdge(
                    source=p.normalized_key,
                    target=d.normalized_key,
                    source_name=p.name,
                    target_name=d.name,
                ))

        return SkillGraphResponse(
            nodes=nodes,
            edges=graph_edges,
            total_nodes=len(nodes),
            total_edges=len(graph_edges),
            telemetry_source="live_dag_engine",
        )
