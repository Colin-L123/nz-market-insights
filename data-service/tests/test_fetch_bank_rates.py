from fetch_bank_rates import parse_prices, deduplicate


def test_parse_prices_extracts_term_and_rate():
    data = {
        "rates": [
            {"term": {"duration": 7, "unit": "day"}, "cardedInterestRate": 1.7},
            {"term": {"duration": 90, "unit": "day"}, "cardedInterestRate": 2.85},
        ]
    }

    result = parse_prices(data)

    assert result == [
        {"term": "7 day", "rate": 1.7},
        {"term": "90 day", "rate": 2.85},
    ]


def test_parse_prices_skips_zero_duration_entry():
    # BNZ 的 feed 里 duration 为 0 的那条不是真实存款期限（一般是"活期"占位），要被过滤掉
    data = {
        "rates": [
            {"term": {"duration": 0, "unit": "day"}, "cardedInterestRate": 0.0},
            {"term": {"duration": 7, "unit": "day"}, "cardedInterestRate": 1.7},
        ]
    }

    result = parse_prices(data)

    assert len(result) == 1
    assert result[0]["term"] == "7 day"


def test_parse_prices_empty_rates_returns_empty_list():
    assert parse_prices({"rates": []}) == []


def test_deduplicate_removes_items_with_same_key():
    items = [{"id": 1}, {"id": 1}, {"id": 2}]

    result = deduplicate(items, key=lambda x: x["id"])

    assert result == [{"id": 1}, {"id": 2}]