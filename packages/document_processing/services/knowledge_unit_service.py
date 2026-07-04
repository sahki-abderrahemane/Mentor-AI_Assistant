"""
packages/document_processing/services/knowledge_unit_service.py
"""

from __future__ import annotations

from document_processing.domain.content import (
    DocumentContent,
    Section,
)
from document_processing.factories.knowledge_unit_factory import (
    KnowledgeUnitFactory,
)
from document_processing.services.base_service import BaseService
from document_processing.services.chunking_service import ChunkingService
from document_processing.splitters.chunking_config import ChunkingConfig


class KnowledgeUnitService(BaseService):
    """
    Generates Knowledge Units from every detected document section.
    """

    def __init__(
        self,
        config: ChunkingConfig,
    ) -> None:

        self.chunking_service = ChunkingService(config)
        self.factory = KnowledgeUnitFactory()

    def generate(
        self,
        section: Section,
    ):
        chunks = self.chunking_service.chunk(section)

        return self.factory.create(
            section=section,
            chunks=chunks,
        )

    def process(
        self,
        content: DocumentContent,
    ) -> DocumentContent:

        knowledge_units = []

        for section in content.sections:
            knowledge_units.extend(
                self.generate(section)
            )

        content.knowledge_units = knowledge_units

        return content