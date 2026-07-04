from __future__ import annotations

from pathlib import Path

from document_processing.domain.document import Document
from document_processing.services.document_processing_service import (
    DocumentProcessingService,
)
from document_processing.splitters.chunking_config import (
    ChunkingConfig,
)


class DocumentProcessingPipeline:
    """
    Public entry point for the Document Processing Engine.

    The pipeline hides the internal orchestration services and exposes
    a simple API for processing documents.
    """

    def __init__(
        self,
        chunking_config: ChunkingConfig | None = None,
    ) -> None:

        self.chunking_config = (
            chunking_config
            or ChunkingConfig(
                min_words=150,
                max_words=500,
            )
        )

        self.processing_service = DocumentProcessingService(
            chunking_config=self.chunking_config,
        )

    def process(
        self,
        pdf_path: Path,
        category: str | None = None,
    ) -> Document:
        """
        Process a PDF document from start to finish.
        """

        return self.processing_service.process(
            pdf_path=pdf_path,
            category=category,
        )