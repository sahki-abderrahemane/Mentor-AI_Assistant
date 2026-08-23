from __future__ import annotations

import re

from document_processing.detectors.base_detector import BaseDetector
from document_processing.domain.content import HeadingCandidate


class HeadingDetector(BaseDetector):
    """
    Detect potential section headings using simple heuristics.
    """

    COMMON_HEADINGS = {
        "abstract",
        "introduction",
        "background",
        "related work",
        "method",
        "methods",
        "approach",
        "experiments",
        "experimental setup",
        "results",
        "discussion",
        "conclusion",
        "references",
        "appendix",
    }

    BACK_MATTER_HEADINGS = {
        "references",
        "bibliography",
        "appendix",
    }

    NUMBERED_HEADING = re.compile(
        r"^\d+(\.\d+)*\s+.+$"
    )

    TITLE_CASE_MIN_RATIO = 0.7

    SENTENCE_ENDING = re.compile(
        r"[.!?:;,]$"
    )

    NOISE_CHARS = re.compile(
        r"[\d|]"
    )

    def detect(
        self,
        text: str,
    ) -> list[HeadingCandidate]:

        candidates = []
        in_back_matter = False

        lines = text.splitlines()

        for index, line in enumerate(lines):

            stripped = line.strip()

            if not stripped:
                continue

            lower = stripped.lower()

            if not in_back_matter and lower in self.BACK_MATTER_HEADINGS:
                in_back_matter = True

            confidence = self._score(
                stripped,
                suppress_title_case=in_back_matter,
            )

            if confidence >= 0.6:

                candidates.append(
                    HeadingCandidate(
                        text=stripped,
                        line_number=index,
                        confidence=confidence,
                    )
                )

        return candidates

    def _is_title_case(
        self,
        line: str,
        words: list[str],
    ) -> bool:

        if not words or len(words) < 3 or len(words) > 10:
            return False

        if self.SENTENCE_ENDING.search(line.rstrip()):
            return False

        if self.NOISE_CHARS.search(line):
            return False

        if line.rstrip().endswith("-"):
            return False

        capitalized = sum(
            1
            for word in words
            if word[:1].isupper()
        )

        return capitalized >= max(
            1,
            int(len(words) * self.TITLE_CASE_MIN_RATIO),
        )

    def _score(
        self,
        line: str,
        *,
        suppress_title_case: bool = False,
    ) -> float:

        score = 0.0

        lower = line.lower()

        if lower in self.COMMON_HEADINGS:
            score += 0.6

        if self.NUMBERED_HEADING.match(line):
            score += 0.4

        if line.isupper():
            score += 0.2

        if len(line.split()) <= 10:
            score += 0.2

        if not suppress_title_case and self._is_title_case(line, line.split()):
            score += 0.4

        return min(score, 1.0)