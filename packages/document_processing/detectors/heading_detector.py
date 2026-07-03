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

    NUMBERED_HEADING = re.compile(
        r"^\d+(\.\d+)*\s+.+$"
    )

    def detect(
        self,
        text: str,
    ) -> list[HeadingCandidate]:

        candidates = []

        lines = text.splitlines()

        for index, line in enumerate(lines):

            stripped = line.strip()

            if not stripped:
                continue

            confidence = self._score(stripped)

            if confidence >= 0.6:

                candidates.append(
                    HeadingCandidate(
                        text=stripped,
                        line_number=index,
                        confidence=confidence,
                    )
                )

        return candidates

    def _score(
        self,
        line: str,
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

        return min(score, 1.0)