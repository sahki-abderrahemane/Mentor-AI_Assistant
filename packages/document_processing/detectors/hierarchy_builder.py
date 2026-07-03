from __future__ import annotations

import re

from document_processing.domain.content import HeadingCandidate, Section


class HierarchyBuilder:
    """
    Converts heading candidates into ordered document sections.
    """

    NUMBER_PATTERN = re.compile(r"^(\d+(?:\.\d+)*)")

    def build(
        self,
        headings: list[HeadingCandidate],
        lines: list[str],
    ) -> list[Section]:

        sections: list[Section] = []

        for index, heading in enumerate(headings):

            level = self._infer_level(heading.text)

            start = heading.line_number

            if index + 1 < len(headings):
                end = headings[index + 1].line_number - 1
            else:
                end = len(lines) - 1

            sections.append(
                Section(
                    title=heading.text,
                    level=level,
                    line_start=start,
                    line_end=end,
                )
            )

        return sections

    def _infer_level(
        self,
        heading: str,
    ) -> int:

        match = self.NUMBER_PATTERN.match(heading)

        if not match:
            return 1

        numbering = match.group(1)

        return numbering.count(".") + 1