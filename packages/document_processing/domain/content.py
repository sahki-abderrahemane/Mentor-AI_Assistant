from __future__ import annotations

from typing import Any

from pydantic import Field

from .base import BaseEntity, MentorModel



class PageContent(MentorModel):
    """
    Represents the extracted content of a single PDF page.
    """

    page_number: int = Field(
        ge=1,
        description="1-based page number."
    )

    text: str = Field(
        description="Raw extracted text for this page."
    )

    layout: dict[str, Any] = Field(
        default_factory=dict,
        description="Raw PyMuPDF page dictionary."
    )

    word_count: int = Field(
        ge=0,
        description="Number of words on this page."
    )

class HeadingCandidate(MentorModel):
    """
    Represents a potential section heading detected in a document.
    """

    text: str = Field(
        description="Heading text."
    )

    line_number: int = Field(
        ge=0,
        description="Line index in the cleaned document."
    )

    confidence: float = Field(
        ge=0.0,
        le=1.0,
        description="Confidence score."
    )


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
    line_start: int = Field(
        ge=0,
        description="Heading line index."
    )

    line_end: int = Field(
        ge=0,
        description="Last line belonging to this section."
    )

    text: str = Field(
        default="",
        description="Section text."
    )

    page_start: int = Field(
        default=1,
        ge=1,
        description="Starting page."
    )

    page_end: int = Field(
        default=1,
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

    document_id: str | None = Field(
        default=None,
        description="Identifier of the source document."
    )

    category: str | None = Field(
        default=None,
        description="Knowledge Unit category."
    )

    tags: list[str] = Field(
        default_factory=list,
        description="Knowledge Unit tags."
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


    pages: list[PageContent] = Field(
        default_factory=list,
        description="Extracted content for every page."
    )

    sections: list[Section] = Field(
        default_factory=list,
        description="Detected document sections."
    )

    knowledge_units: list[KnowledgeUnit] = Field(
        default_factory=list,
        description="Knowledge Units generated from the document."
    )