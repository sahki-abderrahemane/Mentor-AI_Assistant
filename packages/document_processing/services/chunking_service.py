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
        - if it is too large, split it into sentences.

    4. Merge consecutive small fragments until the combined chunk
       reaches the configured minimum size, so tiny pieces (e.g.
       individual reference entries) become coherent chunks.

    Notes:
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

    def _segment(
        self,
        section: Section,
    ) -> list[str]:
        """
        Split the section into atomic pieces (paragraphs, falling back
        to sentences for oversized paragraphs).
        """

        paragraphs = self.paragraph_splitter.split(section.text)

        segments: list[str] = []

        for paragraph in paragraphs:

            if self.validator.is_valid(paragraph):
                segments.append(paragraph)
                continue

            # Oversized paragraph -> split into sentences.
            sentences = self.sentence_splitter.split(paragraph)

            if len(sentences) <= 1:
                segments.append(paragraph)
            else:
                segments.extend(sentences)

        return segments

    def chunk(
        self,
        section: Section,
    ) -> list[str]:

        # Fast path: the whole section is already a valid chunk.
        if self.validator.is_valid(section.text):
            return [section.text]

        segments = self._segment(section)

        chunks: list[str] = []
        buffer: list[str] = []
        buffer_words = 0

        def flush() -> None:
            nonlocal buffer, buffer_words
            if buffer:
                chunks.append("\n\n".join(buffer))
            buffer = []
            buffer_words = 0

        for segment in segments:
            segment_words = len(segment.split())

            # Don't let the buffer exceed max_words once it has started.
            if buffer and buffer_words + segment_words > self.config.max_words:
                flush()

            buffer.append(segment)
            buffer_words += segment_words

            if buffer_words >= self.config.min_words:
                flush()

        flush()

        return chunks