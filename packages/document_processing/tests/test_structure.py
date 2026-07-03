from document_processing.detectors.heading_detector import (
    HeadingDetector,
)


def test_heading_detector():

    detector = HeadingDetector()

    text = """
Abstract

Some abstract.

1 Introduction

Some text.

2 Methods

More text.

Conclusion

Done.
"""

    headings = detector.detect(text)

    assert len(headings) == 4

    assert headings[0].text == "Abstract"

    assert headings[1].text == "1 Introduction"

    assert headings[2].text == "2 Methods"

    assert headings[3].text == "Conclusion"

from document_processing.detectors.hierarchy_builder import (
    HierarchyBuilder,
)
from document_processing.domain.content import HeadingCandidate


def test_hierarchy_builder():

    headings = [
        HeadingCandidate(
            text="1 Introduction",
            line_number=0,
            confidence=1.0,
        ),
        HeadingCandidate(
            text="1.1 Motivation",
            line_number=10,
            confidence=1.0,
        ),
        HeadingCandidate(
            text="2 Method",
            line_number=20,
            confidence=1.0,
        ),
    ]

    lines = [""] * 30

    builder = HierarchyBuilder()

    sections = builder.build(headings, lines)

    assert len(sections) == 3

    assert sections[0].level == 1
    assert sections[1].level == 2
    assert sections[2].level == 1

    assert sections[0].line_start == 0
    assert sections[0].line_end == 9

    assert sections[2].line_end == 29


from document_processing.detectors.section_extractor import (
    SectionExtractor,
)
from document_processing.domain.content import Section


def test_section_extractor():

    cleaned_text = """
Abstract
Abstract text.

1 Introduction
Introduction text.

2 Method
Method text.
""".strip()

    sections = [
        Section(
            title="Abstract",
            level=1,
            line_start=0,
            line_end=2,
        ),
        Section(
            title="1 Introduction",
            level=1,
            line_start=3,
            line_end=5,
        ),
        Section(
            title="2 Method",
            level=1,
            line_start=6,
            line_end=7,
        ),
    ]

    extractor = SectionExtractor()

    sections = extractor.extract(
        cleaned_text,
        sections,
    )

    assert len(sections) == 3

    assert sections[0].title == "Abstract"
    assert "Abstract text." in sections[0].text

    assert sections[1].title == "1 Introduction"
    assert "Introduction text." in sections[1].text

    assert sections[2].title == "2 Method"
    assert "Method text." in sections[2].text