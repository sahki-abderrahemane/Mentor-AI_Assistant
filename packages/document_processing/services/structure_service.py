from __future__ import annotations

from document_processing.detectors.heading_detector import HeadingDetector
from document_processing.detectors.hierarchy_builder import HierarchyBuilder
from document_processing.detectors.section_extractor import SectionExtractor
from document_processing.domain.content import (
    DocumentContent,
)
from document_processing.services.base_service import BaseService


class StructureService(BaseService):
    """
    Detects the logical structure of a cleaned document and populates
    its sections.
    """

    def __init__(self) -> None:

        self.heading_detector = HeadingDetector()
        self.hierarchy_builder = HierarchyBuilder()
        self.section_extractor = SectionExtractor()

    def process(
        self,
        content: DocumentContent,
    ) -> DocumentContent:

        if content.cleaned_text is None:
            content.sections = []
            return content

        headings = self.heading_detector.detect(
            content.cleaned_text,
        )

        boundaries = self.hierarchy_builder.build(
            headings=headings,
            lines=content.cleaned_text.splitlines(),
        )

        content.sections = self.section_extractor.extract(
            cleaned_text=content.cleaned_text,
            boundaries=boundaries,
        )

        return content