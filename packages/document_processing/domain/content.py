"""
packages/document_processing/domain/content.py
"""

from __future__ import annotations

from typing import Any

from pydantic import Field

from .base import BaseEntity, MentorModel


class Section(MentorModel):
    """
    Represents a logical section within a document.
    """

    title: str = Field(
        description="Section title."
    )

    level: int = Field(
        ge=1,
        description="Heading level (1 = top-level section)."
    )

    text: str = Field(
        description="Section text."
    )

    page_start: int = Field(
        ge=1,
        description="Starting page."
    )

    page_end: int = Field(
        ge=1,
        description="Ending page."
    )


class KnowledgeUnit(BaseEntity):
    """
    Smallest reusable semantic unit in MentorAI.
    """

    text: str = Field(
        description="Knowledge Unit content."
    )

    section: Section = Field(
        description="Parent section."
    )

    subsection: str | None = Field(
        default=None,
        description="Optional subsection."
    )

    page_start: int = Field(
        ge=1,
        description="Starting page."
    )

    page_end: int = Field(
        ge=1,
        description="Ending page."
    )

    word_count: int = Field(
        ge=0,
        description="Word count."
    )

    token_count: int | None = Field(
        default=None,
        ge=0,
        description="Optional token count."
    )

    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Additional KU metadata."
    )


class DocumentContent(MentorModel):
    """
    Holds the evolving textual content of a document.
    """

    raw_text: str | None = Field(
        default=None,
        description="Raw extracted text."
    )

    cleaned_text: str | None = Field(
        default=None,
        description="Normalized text."
    )

    sections: list[Section] = Field(
        default_factory=list,
        description="Detected document sections."
    )

    knowledge_units: list[KnowledgeUnit] = Field(
        default_factory=list,
        description="Knowledge Units generated from the document."
    )