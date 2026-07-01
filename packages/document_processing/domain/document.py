"""
packages/document_processing/domain/document.py
"""

from __future__ import annotations
from pathlib import Path

from pydantic import Field

from .base import BaseEntity
from .content import DocumentContent
from .enums import ProcessingStage
from .metadata import DocumentMetadata
from .processing import ProcessingEvent


class Document(BaseEntity):
    """
    Root domain object representing a document as it flows
    through the Document Processing Engine.
    """

    metadata: DocumentMetadata = Field(
        description="Document metadata."
    )

    content: DocumentContent = Field(
        default_factory=DocumentContent,
        description="Document textual content."
    )

    processing_stage: ProcessingStage = Field(
        default=ProcessingStage.INGESTED,
        description="Current processing stage."
    )

    processing_history: list[ProcessingEvent] = Field(
        default_factory=list,
        description="History of processing events."
    )
    source_path: Path | None = Field(
        default=None,
        description="Path to the source file."
    )