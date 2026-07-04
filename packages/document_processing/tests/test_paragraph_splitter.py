"""
packages/document_processing/tests/test_paragraph_splitter.py
"""

from document_processing.splitters.paragraph_splitter import ParagraphSplitter


def test_paragraph_splitter():

    text = """
Paragraph one.

Paragraph two.

Paragraph three.
""".strip()

    splitter = ParagraphSplitter()

    paragraphs = splitter.split(text)

    assert paragraphs == [
        "Paragraph one.",
        "Paragraph two.",
        "Paragraph three.",
    ]