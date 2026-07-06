from __future__ import annotations

import json
from pathlib import Path

from document_processing.domain.document import Document
from document_processing.exporters.base_exporter import BaseExporter


class JSONExporter(BaseExporter):
    """
    Exports a processed document into a JSON file.

    The exported schema is considered the canonical
    dataset representation used by MentorAI.
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

        with output_path.open(
            "w",
            encoding="utf-8",
        ) as file:

            json.dump(
                self._serialize(document),
                file,
                indent=4,
                ensure_ascii=False,
            )

    def _serialize(
        self,
        document: Document,
    ) -> dict:

        return {

            "metadata": (
                document.metadata.model_dump(
                    mode="json",
                )
                if document.metadata
                else None
            ),

            "statistics": (
                document.metadata.statistics.model_dump(
                    mode="json",
                )
                if document.metadata
                else None
            ),

            "sections": [

                section.model_dump(
                    mode="json",
                )

                for section in document.content.sections

            ],

            "knowledge_units": [

                knowledge_unit.model_dump(
                    mode="json",
                )

                for knowledge_unit
                in document.content.knowledge_units

            ],

        }