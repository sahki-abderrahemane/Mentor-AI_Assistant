from __future__ import annotations

from pathlib import Path

from document_processing.domain.document import Document
from document_processing.domain.enums import ExportFormat
from document_processing.factories.exporter_factory import ExporterFactory
from document_processing.services.base_service import BaseService


class DatasetGenerationService(BaseService):
    """
    Generates datasets from processed documents.
    """

    def __init__(
        self,
        export_format: ExportFormat = ExportFormat.JSON,
    ) -> None:

        self.exporter = ExporterFactory.create(
            export_format,
        )

    def process(
        self,
        document: Document,
        output_path: Path,
    ) -> Path:

        self.exporter.export(
            document=document,
            output_path=output_path,
        )

        return output_path