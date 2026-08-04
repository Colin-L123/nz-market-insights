from fetch_loan_rates import parse_loan_rates


def test_parse_loan_rates_extracts_product_term_and_rate():
    # 故意在 label/term 前后加空格，验证 .strip() 真的生效
    xml_text = """<?xml version="1.0"?>
    <rates>
        <rate>
            <label> Standard </label>
            <term> 1 year </term>
            <interest>5.49</interest>
        </rate>
        <rate>
            <label>Premier</label>
            <term>2 year</term>
            <interest>5.29</interest>
        </rate>
    </rates>"""

    result = parse_loan_rates(xml_text)

    assert result == [
        {"product": "Standard", "term": "1 year", "rate": 5.49},
        {"product": "Premier", "term": "2 year", "rate": 5.29},
    ]


def test_parse_loan_rates_empty_feed_returns_empty_list():
    xml_text = "<rates></rates>"

    assert parse_loan_rates(xml_text) == []