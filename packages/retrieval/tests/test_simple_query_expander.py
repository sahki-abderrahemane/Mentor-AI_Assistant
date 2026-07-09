from retrieval.domain.query import (
    Query,
)

from retrieval.query_expanders.simple_query_expander import (
    SimpleQueryExpander,
)


def test_simple_query_expander():

    expander = SimpleQueryExpander()

    query = Query(
        text="machine learning",
    )

    expanded = expander.expand(
        query,
    )

    assert len(expanded) == 4

    assert expanded[0].text == "machine learning"

    assert expanded[1].text == "machine learning overview"

    assert expanded[2].text == "machine learning definition"

    assert expanded[3].text == "machine learning explanation"


def test_simple_query_expander_name():

    expander = SimpleQueryExpander()

    assert expander.name() == "simple"