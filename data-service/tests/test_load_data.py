from load_data import na_to_none


def test_na_to_none_converts_na_string_to_none():
    assert na_to_none("NA") is None


def test_na_to_none_leaves_other_values_unchanged():
    assert na_to_none("123") == "123"
    assert na_to_none("Auckland") == "Auckland"