from __future__ import annotations

import re

from .base_cleaner import BaseCleaner


class ControlCharacterCleaner(BaseCleaner):
    """
    Removes non-printable ASCII control characters while preserving
    newlines and tabs.
    """

    CONTROL_CHARS = re.compile(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]")

    def clean(self, text: str) -> str:
        return self.CONTROL_CHARS.sub("", text)