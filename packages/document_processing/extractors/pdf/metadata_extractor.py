"""
packages/document_processing/extractors/pdf/metadata_extractor.py
"""

from __future__ import annotations

from pathlib import Path

from document_processing.domain.document import Document
from document_processing.extractors.base_extractor import BaseExtractor


class PDFMetadataExtractor(BaseExtractor):
    """
    Extracts metadata from PDF documents.
    """

    def extract(self, document: Document) -> Document:
        """
        Extract metadata from a PDF and populate
        document.metadata.
        """

        pdf_path: Path = document.source_path

        if not pdf_path.exists():
            raise FileNotFoundError(pdf_path)

        # TODO:
        # - Compute SHA-256 checksum
        # - Read embedded PDF metadata
        # - Determine page count
        # - Populate DocumentMetadata
        # - Append ProcessingEvent

        return document