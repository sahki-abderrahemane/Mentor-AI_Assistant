from pathlib import Path

import fitz

from document_processing.domain.content import (
    DocumentContent,
    PageContent,
)


class PDFTextExtractor:
    """
    Extracts raw textual content from PDF documents while preserving
    page boundaries and layout information.

    This class is intentionally limited to extraction only.
    Cleaning, structure detection, and chunking are handled by
    later stages of the DPE pipeline.
    """

    def extract(
        self,
        file_path: Path,
    ) -> DocumentContent:

        pages: list[PageContent] = []

        raw_pages: list[str] = []

        with fitz.open(file_path) as pdf:

            for page_number, page in enumerate(pdf, start=1):

                layout = page.get_text("dict")

                text = page.get_text().strip()

                pages.append(
                    PageContent(
                        page_number=page_number,
                        text=text,
                        layout=layout,
                        word_count=len(text.split()),
                    )
                )

                raw_pages.append(text)

        return DocumentContent(
            raw_text="\n\n".join(raw_pages),
            pages=pages,
        )