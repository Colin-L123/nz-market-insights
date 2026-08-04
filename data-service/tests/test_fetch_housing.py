from fetch_housing import parse_csv


def test_parse_csv_converts_rows_to_dicts():
    csv_text = "Area_Name,Year,Value\nAuckland,2025,100\nWellington,2025,200\n"

    result = parse_csv(csv_text)

    assert result == [
        {"Area_Name": "Auckland", "Year": "2025", "Value": "100"},
        {"Area_Name": "Wellington", "Year": "2025", "Value": "200"},
    ]


def test_parse_csv_header_only_returns_empty_list():
    csv_text = "Area_Name,Year,Value\n"

    assert parse_csv(csv_text) == []