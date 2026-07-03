
from __future__ import annotations

from document_processing.cleaners.base_cleaner import BaseCleaner
from document_processing.cleaners.control_character_cleaner import (
    ControlCharacterCleaner,
)
from document_processing.cleaners.unicode_cleaner import UnicodeCleaner
from document_processing.cleaners.whitespace_cleaner import (
    WhitespaceCleaner,
)
from document_processing.domain.content import DocumentContent


class CleaningService:
    """
    Applies the configured sequence of cleaners to a document.

    The service orchestrates the cleaning pipeline but delegates
    the actual transformations to individual cleaners.
    """

    def __init__(
        self,
        cleaners: list[BaseCleaner] | None = None,
    ) -> None:

        self.cleaners = cleaners or [
            UnicodeCleaner(),
            WhitespaceCleaner(),
            ControlCharacterCleaner(),
        ]

    def clean(
        self,
        content: DocumentContent,
    ) -> DocumentContent:
        """
        Clean the document while preserving raw_text.
        """

        if content.raw_text is None:
            content.cleaned_text = None
            return content

        cleaned = str(content.raw_text)

        for cleaner in self.cleaners:
            cleaned = cleaner.clean(cleaned)

        content.cleaned_text = cleaned

        return content