from __future__ import annotations

from document_processing.domain.enums import ExportFormat
from document_processing.exporters.base_exporter import BaseExporter
from document_processing.exporters.csv_exporter import CSVExporter
from document_processing.exporters.json_exporter import JSONExporter
from document_processing.exporters.jsonl_exporter import JSONLExporter


class ExporterFactory:
    """
    Creates dataset exporters.
    """

    @staticmethod
    def create(
        export_format: ExportFormat,
    ) -> BaseExporter:

        match export_format:

            case ExportFormat.JSON:
                return JSONExporter()
            case ExportFormat.JSONL:
                return JSONLExporter()
            case ExportFormat.CSV:
                return CSVExporter()
            case _:
                raise ValueError(
                    f"Unsupported export format: {export_format}"
                )