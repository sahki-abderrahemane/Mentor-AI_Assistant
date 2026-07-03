from pathlib import Path

import fitz

from document_processing.domain.metadata import DocumentMetadata
from document_processing.mappers.metadata_mapper import MetadataMapper


class PDFMetadataExtractor:

    def extract(
        self,
        file_path: Path,
        category: str | None = None,
        source: str | None = None,
        url: str | None = None,
    ) -> DocumentMetadata:

        with fitz.open(file_path) as pdf:
            return MetadataMapper.from_pdf(
                pdf=pdf,
                file_path=file_path,
                category=category,
                source=source,
                url=url,
            )