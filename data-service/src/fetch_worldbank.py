import requests

WORLD_BANK_BASE_URL = "https://api.worldbank.org/v2/country/NZ/indicator"

# 指标代码是 World Bank 自己定义的，每个代表一个具体的经济指标
INDICATORS = {
    "inflation_rate": "FP.CPI.TOTL.ZG",
    "gdp_growth_rate": "NY.GDP.MKTP.KD.ZG",
    "unemployment_rate": "SL.UEM.TOTL.ZS",
}

# print(type(INDICATORS))
print((INDICATORS.items()))

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",#"Referer": "https://www.google.com/",
    #"Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7"
}


def fetch_indicator(indicator_code: str) -> list:
    """Fetch one World Bank indicator's raw response for NZ."""
    url = f"{WORLD_BANK_BASE_URL}/{indicator_code}"
    response = requests.get(url, headers=HEADERS, params={"format": "json", "per_page": 20}, timeout=10)
    response.raise_for_status()
    # print(type(response.json()))
    return response.json()


def parse_indicator(records: list, value_key: str) -> list[dict]:
    """Turn World Bank's [{'date':..., 'value':...}, ...] into [{'year':..., value_key:...}, ...]."""
    data = []
    for item in records:
        data.append({"year": item["date"], value_key: item["value"]})
    return data


def fetch_all_indicators() -> dict[str, list[dict]]:
    """Fetch and parse every indicator in INDICATORS, keyed by name."""
    results = {}
    for name, code in INDICATORS.items():
        raw = fetch_indicator(code)
        records = raw[1]
        results[name] = parse_indicator(records, name)
    return results


if __name__ == "__main__":
    for name, rows in fetch_all_indicators().items():
        print(f"=== {name} ({len(rows)} rows) ===")
        for row in rows[:3]:
            print(row)
        print()