from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional, Dict, Any
from datetime import datetime, timezone
import re
import uuid


def _sanitize(v: str) -> str:
    v = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', v)
    return v.strip()


class ResumeRequest(BaseModel):
    resume_text: str = Field(..., min_length=10, max_length=10000)
    target_role: str = Field(..., min_length=2, max_length=200)
    country: str = Field(..., min_length=2, max_length=100)
    emergent_mode: bool = False

    @field_validator('resume_text', 'target_role', 'country')
    @classmethod
    def sanitize_input(cls, v):
        return _sanitize(v)


class ProjectRequest(BaseModel):
    topic: str = Field(..., min_length=3, max_length=500)
    branch: str = Field(..., min_length=2, max_length=200)
    emergent_mode: bool = False

    @field_validator('topic', 'branch')
    @classmethod
    def sanitize_input(cls, v):
        return _sanitize(v)


class EnglishRequest(BaseModel):
    text: str = Field(..., min_length=5, max_length=5000)
    emergent_mode: bool = False

    @field_validator('text')
    @classmethod
    def sanitize_input(cls, v):
        return _sanitize(v)


class InterviewRequest(BaseModel):
    question_type: str = Field(..., min_length=5, max_length=500)
    background: Optional[str] = Field(None, max_length=3000)
    emergent_mode: bool = False

    @field_validator('question_type')
    @classmethod
    def sanitize_input(cls, v):
        return _sanitize(v)

    @field_validator('background')
    @classmethod
    def sanitize_background(cls, v):
        if v is not None:
            return _sanitize(v)
        return v


class GenerationHistory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str
    title: str
    content: Dict[str, Any]
    credits_used: int
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
