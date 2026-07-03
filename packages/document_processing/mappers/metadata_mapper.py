"""
document_processing/mappers/metadata_mapper.py
"""

from __future__ import annotations

from pathlib import Path

import fitz

from document_processing.domain.enums import SourceType
from document_processing.domain.metadata import (
    DocumentInfo,
    DocumentMetadata,
    DocumentStatistics,
    FileInfo,
    SourceInfo,
)
from document_processing.utils.hash import compute_sha256
from document_processing.utils.text import parse_authors
from document_processing.utils.date import parse_pdf_date

class MetadataMapper:
    """
    Maps raw metadata from external libraries
    into MentorAI domain models.
    """

    @staticmethod
    def from_pdf(
        pdf: fitz.Document,
        file_path: Path,
        category: str | None = None,
        source: str | None = None,
        url: str | None = None,
    ) -> DocumentMetadata:

        metadata = pdf.metadata or {}

        keywords = metadata.get("keywords") or ""

        return DocumentMetadata(
            document=DocumentInfo(
                title=metadata.get("title"),
                authors=parse_authors(metadata.get("author")),
                category=category,
                language=None,
                abstract=None,
                keywords=[
                    keyword.strip()
                    for keyword in keywords.split(",")
                    if keyword.strip()
                ],
                creation_date=parse_pdf_date(metadata.get("creationDate")),
            ),
            file=FileInfo(
                filename=file_path.name,
                extension=file_path.suffix.lower(),
                file_size=file_path.stat().st_size,
                checksum=compute_sha256(file_path),
            ),
            source=SourceInfo(
                source_type=SourceType.LOCAL,
                source=source,
                url=url,
                license=None,
            ),
            statistics=DocumentStatistics(
                page_count=pdf.page_count,
            ),
        )