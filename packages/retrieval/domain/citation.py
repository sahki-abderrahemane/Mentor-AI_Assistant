from __future__ import annotations

from pydantic import Field

from .base import MentorModel
from .retrieved_knowledge_unit import RetrievedKnowledgeUnit


class Citation(MentorModel):
    """
    Represents a citation generated from a retrieved
    Knowledge Unit.
    """

    retrieved_unit: RetrievedKnowledgeUnit = Field(
        description="Retrieved Knowledge Unit referenced by the citation."
    )

    title: str | None = Field(
        default=None,
        description="Document title."
    )

    section: str | None = Field(
        default=None,
        description="Section title."
    )

    subsection: str | None = Field(
        default=None,
        description="Optional subsection title."
    )

    page_start: int = Field(
        ge=1,
        description="Starting page."
    )

    page_end: int = Field(
        ge=1,
        description="Ending page."
    )

    snippet: str = Field(
        description="Excerpt shown to the user."
    )

    confidence: float = Field(
        ge=0.0,
        le=1.0,
        description="Confidence of the citation."
    )

    metadata: dict[str, str] = Field(
        default_factory=dict,
        description="Additional citation metadata."
    )