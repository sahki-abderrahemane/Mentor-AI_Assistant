from __future__ import annotations

from document_processing.domain.content import (
    Section
)


class SectionExtractor:
    """
    Builds complete Section objects from section boundaries.
    """

    def extract(
        self,
        cleaned_text: str,
        boundaries: list[Section],
    ) -> list[Section]:

        lines = cleaned_text.splitlines()

        sections: list[Section] = []

        for boundary in boundaries:

            section_lines = lines[
                boundary.line_start : boundary.line_end + 1
            ]

            text = "\n".join(section_lines).strip()

            sections.append(
                Section(
                    title=boundary.title,
                    level=boundary.level,
                    line_start=boundary.line_start,
                    line_end=boundary.line_end,
                    text=text,
                    page_start=1,
                    page_end=1,
                )
            )

        return sections