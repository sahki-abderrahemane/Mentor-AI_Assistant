"""
packages/document_processing/domain/metadata.py
"""

from __future__ import annotations

from pydantic import Field

from .base import MentorModel
from .enums import DocumentFormat, SourceType


class DocumentInfo(MentorModel):
    """Describes the intellectual content of a document."""

    title: str | None = Field(
        default=None,
        description="Document title.",
    )

    authors: list[str] = Field(
        default_factory=list,
        description="List of document authors.",
    )

    language: str | None = Field(
        default=None,
        description="Document language.",
    )

    category: str | None = Field(
        default=None,
        description="High-level document category.",
    )

    keywords: list[str] = Field(
        default_factory=list,
        description="Document keywords.",
    )

    abstract: str | None = Field(
        default=None,
        description="Document abstract.",
    )


class FileInfo(MentorModel):
    """Describes the physical file."""

    filename: str = Field(
        description="Original filename."
    )

    format: DocumentFormat = Field(
        description="Document format."
    )

    extension: str = Field(
        description="File extension."
    )

    file_size: int = Field(
        gt=0,
        description="File size in bytes."
    )

    checksum: str = Field(
        min_length=64,
        max_length=64,
        description="SHA-256 checksum."
    )


class SourceInfo(MentorModel):
    """Describes where the document came from."""

    source_type: SourceType = Field(
        description="Origin of the document."
    )

    source: str | None = Field(
        default=None,
        description="Human-readable source name."
    )

    url: str | None = Field(
        default=None,
        description="Original document URL."
    )

    license: str | None = Field(
        default=None,
        description="Document license."
    )


class DocumentStatistics(MentorModel):
    """Statistics about the document."""

    page_count: int = Field(
        ge=1,
        description="Number of pages."
    )

    word_count: int | None = Field(
        default=None,
        ge=0,
        description="Total word count."
    )

    character_count: int | None = Field(
        default=None,
        ge=0,
        description="Total character count."
    )

    sentence_count: int | None = Field(
        default=None,
        ge=0,
        description="Total sentence count."
    )


class DocumentMetadata(MentorModel):
    """Complete metadata associated with a document."""

    document: DocumentInfo = Field(
        description="Document-level metadata."
    )

    file: FileInfo = Field(
        description="File metadata."
    )

    source: SourceInfo = Field(
        description="Source metadata."
    )

    statistics: DocumentStatistics = Field(
        description="Document statistics."
    )