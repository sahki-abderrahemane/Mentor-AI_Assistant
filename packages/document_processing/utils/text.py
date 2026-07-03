from __future__ import annotations

import re

_AUTHOR_SEPARATOR_PATTERN = re.compile(
    r"\s*(?:,|;|\band\b)\s*",
    flags=re.IGNORECASE,
)


def parse_authors(author_string: str | None) -> list[str]:
    """
    Parse an author string into a list of author names.

    Examples
    --------
    >>> parse_authors("Alice, Bob")
    ['Alice', 'Bob']

    >>> parse_authors("Alice and Bob")
    ['Alice', 'Bob']

    >>> parse_authors(None)
    []
    """

    if not author_string:
        return []

    author_string = author_string.strip()

    if not author_string:
        return []

    authors = _AUTHOR_SEPARATOR_PATTERN.split(author_string)

    return [author.strip() for author in authors if author.strip()]