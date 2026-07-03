from __future__ import annotations

import re

from .base_cleaner import BaseCleaner


class WhitespaceCleaner(BaseCleaner):
    """
    Normalizes whitespace while preserving paragraph boundaries.
    """

    def clean(self, text: str) -> str:
        # Normalize Windows line endings
        text = text.replace("\r\n", "\n")
        text = text.replace("\r", "\n")

        # Remove trailing spaces
        text = re.sub(r"[ \t]+", " ", text)

        # Remove spaces before newlines
        text = re.sub(r" +\n", "\n", text)

        # Collapse excessive blank lines
        text = re.sub(r"\n{3,}", "\n\n", text)

        return text.strip()