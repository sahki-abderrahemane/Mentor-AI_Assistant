
from __future__ import annotations

import re

from document_processing.domain.content import Section
from document_processing.splitters.base_splitter import BaseSplitter
class ParagraphSplitter(BaseSplitter):

    def split(
        self,
        text: str,
    ) -> list[str]:

        paragraphs = [
            paragraph.strip()
            for paragraph in re.split(r"\n\s*\n", text)
            if paragraph.strip()
        ]

        return paragraphs