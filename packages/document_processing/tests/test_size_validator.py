from document_processing.splitters.chunking_config import ChunkingConfig
from document_processing.splitters.size_validator import SizeValidator


def make_text(word_count: int) -> str:
    return " ".join(["word"] * word_count)


def test_word_count():

    validator = SizeValidator(ChunkingConfig())

    assert validator.word_count(
        "one two three"
    ) == 3


def test_is_too_small():

    config = ChunkingConfig(
        min_words=20,
        max_words=100,
    )

    validator = SizeValidator(config)

    assert validator.is_too_small(make_text(10))

    assert not validator.is_too_small(make_text(20))


def test_is_too_large():

    config = ChunkingConfig(
        min_words=20,
        max_words=100,
    )

    validator = SizeValidator(config)

    assert validator.is_too_large(make_text(101))

    assert not validator.is_too_large(make_text(50))


def test_is_valid():

    config = ChunkingConfig(
        min_words=20,
        max_words=100,
    )

    validator = SizeValidator(config)

    assert validator.is_valid(make_text(50))

    assert not validator.is_valid(make_text(10))

    assert not validator.is_valid(make_text(120))