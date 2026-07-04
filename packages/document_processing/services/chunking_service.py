"""
packages/document_processing/services/chunking_service.py
"""

from __future__ import annotations

from document_processing.domain.content import Section
from document_processing.splitters.chunking_config import ChunkingConfig
from document_processing.splitters.paragraph_splitter import ParagraphSplitter
from document_processing.splitters.sentence_splitter import SentenceSplitter
from document_processing.splitters.size_validator import SizeValidator


class ChunkingService:
    """
    Orchestrates the hierarchical chunking process.

    Strategy (V2):

    1. If the whole section already satisfies the configured size
       constraints, return it unchanged.

    2. Otherwise, split the section into paragraphs.

    3. For each paragraph:
        - if it is valid, keep it.
        - if it is too large, split it into sentences.

    Notes:
        - Merging small chunks is NOT implemented yet.
        - Overlap is NOT implemented yet.
        - Recursive splitting is NOT implemented yet.
    """

    def __init__(
        self,
        config: ChunkingConfig,
    ) -> None:
        self.config = config

        self.validator = SizeValidator(config)
        self.paragraph_splitter = ParagraphSplitter()
        self.sentence_splitter = SentenceSplitter()

    def chunk(
        self,
        section: Section,
    ) -> list[str]:

        # Fast path: the whole section is already a valid chunk.
        if self.validator.is_valid(section.text):
            return [section.text]

        chunks: list[str] = []

        paragraphs = self.paragraph_splitter.split(section.text)

        for paragraph in paragraphs:

            if self.validator.is_valid(paragraph):
                chunks.append(paragraph)
                continue

            # Oversized paragraph -> split into sentences.
            sentences = self.sentence_splitter.split(paragraph)

            chunks.extend(sentences)

        return chunks