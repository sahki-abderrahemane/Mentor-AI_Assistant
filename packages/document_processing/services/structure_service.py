"""
packages/document_processing/services/structure_service.py
"""

from __future__ import annotations

from document_processing.detectors.heading_detector import HeadingDetector
from document_processing.detectors.hierarchy_builder import HierarchyBuilder
from document_processing.detectors.section_extractor import SectionExtractor
from document_processing.domain.content import Section
from document_processing.services.base_service import BaseService


class StructureService(BaseService):
    """
    Builds the logical structure of a cleaned document.
    """

    def __init__(self) -> None:
        self.heading_detector = HeadingDetector()
        self.hierarchy_builder = HierarchyBuilder()
        self.section_extractor = SectionExtractor()

    def process(
        self,
        cleaned_text: str,
    ) -> list[Section]:

        headings = self.heading_detector.detect(cleaned_text)

        sections = self.hierarchy_builder.build(
            headings=headings,
            lines=cleaned_text.splitlines(),
        )

        return self.section_extractor.extract(
            cleaned_text=cleaned_text,
            boundaries=sections,
        )