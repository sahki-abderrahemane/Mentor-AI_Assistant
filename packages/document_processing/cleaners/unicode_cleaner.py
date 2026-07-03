from __future__ import annotations

import unicodedata

from .base_cleaner import BaseCleaner


class UnicodeCleaner(BaseCleaner):
    """
    Normalizes Unicode text.

    Uses NFC normalization to compose equivalent Unicode sequences.
    """

    def clean(self, text: str) -> str:
        return unicodedata.normalize("NFC", text)