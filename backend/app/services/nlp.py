"""
SkillGap NLP & Resume Ingestion Service
Extracts text from PDF, DOCX, and TXT binary payloads, normalizes technical tokens against
a 90+ canonical alias lexicon, infers proficiency, and persists updates to the user record.
"""

import re
import io
import zipfile
import xml.etree.ElementTree as ET
from typing import List, Dict, Set, Tuple, Optional
from sqlalchemy.orm import Session

from app.models.domain import User, Skill, UserSkillProficiency
from app.schemas.payload import ResumeUploadResponse, ExtractedSkillToken
from app.services.graph import GraphService


class NLPService:
    """Natural Language Processing & Skill Token Normalization Engine."""

    # 90+ Canonical Technical Alias Lexicon
    ALIAS_LEXICON: Dict[str, str] = {
        # Python Ecosystem
        "python": "python",
        "python3": "python",
        "py": "python",
        "fastapi": "fastapi",
        "fast-api": "fastapi",
        "sqlalchemy": "sqlalchemy",
        "flask": "fastapi",
        "django": "fastapi",
        "celery": "event_driven",
        "pydantic": "fastapi",
        "pytest": "python",
        
        # TypeScript / JavaScript
        "typescript": "typescript",
        "ts": "typescript",
        "javascript": "typescript",
        "js": "typescript",
        "ecmascript": "typescript",
        "nodejs": "typescript",
        "node.js": "typescript",
        "node": "typescript",
        "nextjs": "nextjs",
        "next.js": "nextjs",
        "next": "nextjs",
        "react": "react",
        "reactjs": "react",
        "react.js": "react",
        "react native": "react",
        "redux": "react",
        "tailwind": "tailwind",
        "tailwindcss": "tailwind",
        "tailwind css": "tailwind",
        
        # Databases & Storage
        "postgresql": "postgresql",
        "postgres": "postgresql",
        "pg": "postgresql",
        "sql": "sql",
        "mysql": "sql",
        "sqlite": "sql",
        "redis": "redis",
        "elastic": "system_design",
        "elasticsearch": "system_design",
        "mongodb": "database",
        
        # DevOps & Infrastructure
        "docker": "docker",
        "dockerfile": "docker",
        "docker-compose": "docker",
        "container": "docker",
        "containers": "docker",
        "kubernetes": "kubernetes",
        "k8s": "kubernetes",
        "helm": "kubernetes",
        "kubectl": "kubernetes",
        "linux": "linux",
        "ubuntu": "linux",
        "debian": "linux",
        "bash": "linux",
        "shell": "linux",
        "git": "git",
        "github": "git",
        "gitlab": "git",
        "cicd": "cicd",
        "ci/cd": "cicd",
        "github actions": "cicd",
        "jenkins": "cicd",
        "terraform": "devops",
        "aws": "devops",
        
        # AI / ML & LLMs
        "machine learning": "ml_foundations",
        "deep learning": "ml_foundations",
        "ml": "ml_foundations",
        "pytorch": "ml_foundations",
        "tensorflow": "ml_foundations",
        "scikit-learn": "ml_foundations",
        "langchain": "langchain",
        "llamaindex": "langchain",
        "llama-index": "langchain",
        "openai": "prompt_eng",
        "gpt-4": "prompt_eng",
        "llm": "prompt_eng",
        "llms": "prompt_eng",
        "prompt engineering": "prompt_eng",
        "rag": "vectordb",
        "vector database": "vectordb",
        "vector db": "vectordb",
        "pinecone": "vectordb",
        "chroma": "vectordb",
        "chromadb": "vectordb",
        "weaviate": "vectordb",
        "qdrant": "vectordb",
        "embeddings": "vectordb",
        
        # Architecture & APIs
        "system design": "system_design",
        "distributed systems": "system_design",
        "microservices": "microservices",
        "rest": "rest_apis",
        "restful": "rest_apis",
        "rest apis": "rest_apis",
        "graphql": "graphql",
        "grpc": "microservices",
        "kafka": "event_driven",
        "rabbitmq": "event_driven",
        "event driven": "event_driven",
        "event-driven": "event_driven",
        "websockets": "fastapi",
    }

    # Seniority keyword multipliers for proficiency inference
    SENIORITY_INDICATORS = {
        "lead": 0.20,
        "principal": 0.25,
        "architect": 0.25,
        "staff": 0.25,
        "senior": 0.15,
        "production": 0.15,
        "optimized": 0.10,
        "scaled": 0.15,
        "designed": 0.10,
        "built": 0.10,
        "implemented": 0.05,
        "mastered": 0.20,
    }

    @classmethod
    def extract_text_from_payload(cls, file_bytes: bytes, filename: str) -> str:
        """Extracts plain text from PDF, DOCX, or TXT file bytes."""
        name_lower = filename.lower()

        # 1. Plain text
        if name_lower.endswith(".txt") or name_lower.endswith(".md"):
            return file_bytes.decode("utf-8", errors="ignore")

        # 2. DOCX (OpenXML zip structure)
        if name_lower.endswith(".docx"):
            try:
                with zipfile.ZipFile(io.BytesIO(file_bytes)) as docx_zip:
                    xml_content = docx_zip.read("word/document.xml")
                    tree = ET.fromstring(xml_content)
                    paragraphs = []
                    for node in tree.iter():
                        if node.tag.endswith("}t") and node.text:
                            paragraphs.append(node.text)
                    return " ".join(paragraphs)
            except Exception:
                pass

        # 3. PDF parsing
        try:
            text_chunks = []
            # Extract printable ASCII / UTF-8 text streams from PDF stream blocks
            raw_text = file_bytes.decode("latin-1", errors="ignore")
            stream_matches = re.findall(r"stream[\r\n]+(.*?)[\r\n]+endstream", raw_text, re.DOTALL)
            for s in stream_matches:
                # Filter printable readable strings
                cleaned = re.sub(r"[^\x20-\x7E\n\r\t]", " ", s)
                if len(cleaned.strip()) > 10:
                    text_chunks.append(cleaned)
            
            if text_chunks:
                return " ".join(text_chunks)
        except Exception:
            pass

        # Fallback raw decoding
        return file_bytes.decode("utf-8", errors="ignore")

    @classmethod
    def parse_and_normalize_resume(
        cls,
        file_bytes: bytes,
        filename: str,
        user_id: str,
        db: Session
    ) -> ResumeUploadResponse:
        """
        Parses resume bytes, matches against alias lexicon, infers proficiency,
        and updates the user's proficiency records in PostgreSQL/SQLite.
        """
        raw_text = cls.extract_text_from_payload(file_bytes, filename)
        text_lower = raw_text.lower()

        matched_keys: Dict[str, float] = {}

        # 1. Match technical aliases with word-boundary guards
        for alias, normalized_key in cls.ALIAS_LEXICON.items():
            pattern = r"\b" + re.escape(alias) + r"\b"
            matches = list(re.finditer(pattern, text_lower))
            if matches:
                # Baseline proficiency for direct match
                base_prof = 0.65
                
                # Check surrounding context (window of ±80 characters) for seniority cues
                context_bonus = 0.0
                for match in matches:
                    start = max(0, match.start() - 80)
                    end = min(len(text_lower), match.end() + 80)
                    window = text_lower[start:end]
                    
                    for keyword, bonus in cls.SENIORITY_INDICATORS.items():
                        if keyword in window:
                            context_bonus = max(context_bonus, bonus)

                inferred = min(0.95, base_prof + context_bonus)
                if normalized_key not in matched_keys or inferred > matched_keys[normalized_key]:
                    matched_keys[normalized_key] = inferred

        # If sparse or binary parsing yield was small, ensure core baseline tokens if present
        if not matched_keys:
            # Fallback common match check on text stream
            for word in ["python", "docker", "kubernetes", "react", "fastapi", "sql", "linux"]:
                if word in text_lower:
                    matched_keys[word] = 0.70

        # 2. Persist proficiencies to database for this user
        all_skills = db.query(Skill).all()
        skill_by_key = {s.normalized_key: s for s in all_skills}
        extracted_display_names: List[str] = []

        for norm_key, prof_score in matched_keys.items():
            if norm_key in skill_by_key:
                skill = skill_by_key[norm_key]
                extracted_display_names.append(skill.name)
                
                user_prof = db.query(UserSkillProficiency).filter(
                    UserSkillProficiency.user_id == user_id,
                    UserSkillProficiency.skill_id == skill.id
                ).first()

                if user_prof:
                    # Update to max of existing or newly extracted
                    user_prof.proficiency = max(user_prof.proficiency, prof_score)
                    user_prof.source = "resume"
                else:
                    db.add(UserSkillProficiency(
                        user_id=user_id,
                        skill_id=skill.id,
                        proficiency=prof_score,
                        source="resume"
                    ))

        # Mark resume as uploaded on user
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.resume_uploaded = True

        db.commit()

        # 3. Compute new aggregate readiness score
        dashboard = GraphService.get_dashboard_analysis(user_id=user_id, db=db)

        return ResumeUploadResponse(
            success=True,
            extracted_skills=sorted(list(set(extracted_display_names))),
            matched_count=len(extracted_display_names),
            message=f"Resume '{filename}' parsed successfully. {len(extracted_display_names)} DAG skill tokens normalized.",
            updated_readiness=dashboard.overall_readiness,
        )
