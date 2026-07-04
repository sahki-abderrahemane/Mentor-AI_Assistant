"""
packages/document_processing/tests/test_sentence_splitter.py
"""

from document_processing.splitters.sentence_splitter import SentenceSplitter


def test_sentence_splitter():

    text = (
        "Sentence one. "
        "Sentence two! "
        "Sentence three?"
    )

    splitter = SentenceSplitter()

    sentences = splitter.split(text)

    assert sentences == [
        "Sentence one.",
        "Sentence two!",
        "Sentence three?",
    ]