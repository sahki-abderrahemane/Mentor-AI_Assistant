from __future__ import annotations

from document_processing.splitters.chunking_config import ChunkingConfig


class SizeValidator:
    """
    Validates chunk sizes according to the configured limits.
    """

    def __init__(
        self,
        config: ChunkingConfig,
    ) -> None:
        self.config = config

    @staticmethod
    def word_count(text: str) -> int:
        """
        Compute the number of words in a text.
        """
        return len(text.split())

    def is_too_small(
        self,
        text: str,
    ) -> bool:
        """
        Return True if the text is smaller than the minimum size.
        """
        return self.word_count(text) < self.config.min_words

    def is_too_large(
        self,
        text: str,
    ) -> bool:
        """
        Return True if the text exceeds the maximum size.
        """
        return self.word_count(text) > self.config.max_words

    def is_valid(
        self,
        text: str,
    ) -> bool:
        """
        Return True if the text size is within the configured limits.
        """
        return (
            not self.is_too_small(text)
            and not self.is_too_large(text)
        )