from __future__ import annotations

import json
from pathlib import Path

from document_processing.domain.document import Document
from document_processing.exporters.base_exporter import BaseExporter


class JSONLExporter(BaseExporter):
    """
    Exports every Knowledge Unit as one JSONL record.
    """

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
        ) as file:

            for knowledge_unit in document.content.knowledge_units:

                json.dump(
                    self._serialize(
                        title,
                        knowledge_unit,
                    ),
                    file,
                    ensure_ascii=False,
                )

                file.write("\n")

    def _serialize(
        self,
        document_title: str | None,
        knowledge_unit,
    ) -> dict:

        return {
            "document_title": document_title,
            "section": knowledge_unit.section.title,
            "subsection": knowledge_unit.subsection,
            "page_start": knowledge_unit.page_start,
            "page_end": knowledge_unit.page_end,
            "word_count": knowledge_unit.word_count,
            "text": knowledge_unit.text,
            "metadata": knowledge_unit.metadata,
        }