from document_processing.utils.text import parse_authors


def test_none():
    assert parse_authors(None) == []


def test_empty():
    assert parse_authors("") == []


def test_single_author():
    assert parse_authors("Alice") == ["Alice"]


def test_comma():
    assert parse_authors("Alice, Bob") == ["Alice", "Bob"]


def test_semicolon():
    assert parse_authors("Alice; Bob") == ["Alice", "Bob"]


def test_and():
    assert parse_authors("Alice and Bob") == ["Alice", "Bob"]


def test_mixed():
    assert parse_authors("Alice; Bob, Charlie and David") == [
        "Alice",
        "Bob",
        "Charlie",
        "David",
    ]


def test_extra_spaces():
    assert parse_authors(" Alice ;   Bob ") == [
        "Alice",
        "Bob",
    ]


def test_multiple_separators():
    assert parse_authors("Alice,, Bob;;; Charlie") == [
        "Alice",
        "Bob",
        "Charlie",
    ]