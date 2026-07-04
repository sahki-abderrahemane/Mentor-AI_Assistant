from __future__ import annotations

import re

from document_processing.splitters.base_splitter import BaseSplitter
from document_processing.domain.content import Section


class SentenceSplitter(BaseSplitter):
    """
    Splits a section into sentences.

    This splitter uses a lightweight regex-based approach.
    It can later be replaced with spaCy or another NLP library
    without affecting the rest of the pipeline.
    """

    SENTENCE_PATTERN = re.compile(
        r"(?<=[.!?])\s+"
    )

    def split(
        self,
        text: str,
    ) -> list[str]:

        return [
            sentence.strip()
            for sentence in self.SENTENCE_PATTERN.split(text)
            if sentence.strip()
        ]