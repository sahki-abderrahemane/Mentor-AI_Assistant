from __future__ import annotations

from datetime import UTC, datetime
from pathlib import Path
from typing import Any, Callable

from document_processing.domain.document import Document
from document_processing.domain.enums import (
    ProcessingStage,
    ProcessingStatus,
)
from document_processing.domain.processing import ProcessingEvent
from document_processing.extractors.pdf.metadata_extractor import (
    PDFMetadataExtractor,
)
from document_processing.extractors.pdf.text_extractor import (
    PDFTextExtractor,
)
from document_processing.services.base_service import BaseService
from document_processing.services.cleaning_service import (
    CleaningService,
)
from document_processing.services.knowledge_unit_service import (
    KnowledgeUnitService,
)
from document_processing.services.structure_service import (
    StructureService,
)
from document_processing.splitters.chunking_config import (
    ChunkingConfig,
)


class DocumentProcessingService(BaseService):
    """
    Main orchestration service for the Document Processing Engine.

    Coordinates every stage of the pipeline while recording
    execution history.
    """

    def __init__(
        self,
        chunking_config: ChunkingConfig,
    ) -> None:

        self.metadata_extractor = PDFMetadataExtractor()

        self.text_extractor = PDFTextExtractor()

        self.cleaning_service = CleaningService()

        self.structure_service = StructureService()

        self.knowledge_service = KnowledgeUnitService(
            chunking_config,
        )

    def _run_stage(
        self,
        *,
        document: Document,
        stage: ProcessingStage,
        message: str,
        action: Callable[[], Any],
    ) -> Any:
        """
        Executes one processing stage while recording its execution.
        """

        started = datetime.now(UTC)

        event = ProcessingEvent(
            step=stage,
            status=ProcessingStatus.RUNNING,
            started_at=started,
            message=message,
        )

        try:

            result = action()

            event.status = ProcessingStatus.SUCCESS

            return result

        except Exception as exc:

            event.status = ProcessingStatus.FAILED
            event.message = str(exc)

            raise

        finally:

            finished = datetime.now(UTC)

            event.finished_at = finished

            event.duration_ms = int(
                (finished - started).total_seconds() * 1000
            )

            document.processing_stage = stage

            document.processing_history.append(
                event
            )

    def process(
        self,
        pdf_path: Path,
        category: str | None = None,
    ) -> Document:

        document = Document(
            source_path=pdf_path,
            processing_stage=ProcessingStage.INGESTED,
        )

        self._run_stage(
            document=document,
            stage=ProcessingStage.METADATA_EXTRACTED,
            message="Metadata extracted.",
            action=lambda: setattr(
                document,
                "metadata",
                self.metadata_extractor.extract(
                    file_path=pdf_path,
                    category=category,
                ),
            ),
        )

        self._run_stage(
            document=document,
            stage=ProcessingStage.TEXT_EXTRACTED,
            message="Text extracted.",
            action=lambda: setattr(
                document,
                "content",
                self.text_extractor.extract(
                    file_path=pdf_path,
                ),
            ),
        )

        self._run_stage(
            document=document,
            stage=ProcessingStage.CLEANED,
            message="Document cleaned.",
            action=lambda: setattr(
                document,
                "content",
                self.cleaning_service.clean(
                    document.content,
                ),
            ),
        )

        self._run_stage(
            document=document,
            stage=ProcessingStage.STRUCTURE_DETECTED,
            message="Document structure detected.",
            action=lambda: setattr(
                document,
                "content",
                self.structure_service.process(
                    document.content,
                ),
            ),
        )

        self._run_stage(
            document=document,
            stage=ProcessingStage.CHUNKED,
            message="Knowledge Units generated.",
            action=lambda: setattr(
                document,
                "content",
                self.knowledge_service.process(
                    document.content,
                ),
            ),
        )

        document.processing_stage = ProcessingStage.COMPLETED

        return document