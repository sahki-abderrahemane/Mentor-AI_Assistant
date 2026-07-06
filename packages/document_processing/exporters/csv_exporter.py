from __future__ import annotations

import csv
from pathlib import Path

from document_processing.domain.document import Document
from document_processing.exporters.base_exporter import BaseExporter


class CSVExporter(BaseExporter):
    """
    Exports Knowledge Units into CSV format.
    """

    HEADER = [
        "document_title",
        "section",
        "subsection",
        "page_start",
        "page_end",
        "word_count",
        "text",
    ]

    def export(
        self,
        document: Document,
        output_path: Path,
    ) -> None:

        output_path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        title = document.metadata.document.title

        with output_path.open(
            "w",
            encoding="utf-8",
            newline="",
        ) as file:

            writer = csv.writer(file)

            writer.writerow(self.HEADER)

            for ku in document.content.knowledge_units:

                writer.writerow(
                    [
                        title,
                        ku.section.title,
                        ku.subsection,
                        ku.page_start,
                        ku.page_end,
                        ku.word_count,
                        ku.text,
                    ]
                )