from document_processing.cleaners.unicode_cleaner import UnicodeCleaner
from document_processing.cleaners.whitespace_cleaner import WhitespaceCleaner


def test_unicode_cleaner():

    cleaner = UnicodeCleaner()

    text = "Cafe\u0301"

    cleaned = cleaner.clean(text)

    assert cleaned == "Café"


def test_whitespace_cleaner():

    cleaner = WhitespaceCleaner()

    text = "Hello     world\n\n\n\nPython"

    cleaned = cleaner.clean(text)

    assert cleaned == "Hello world\n\nPython"

from document_processing.cleaners.control_character_cleaner import (
    ControlCharacterCleaner,
)


def test_control_character_cleaner():

    cleaner = ControlCharacterCleaner()

    text = "Hello\x00 World\x07\nPython\tAI"

    cleaned = cleaner.clean(text)

    assert cleaned == "Hello World\nPython\tAI"