import pandas as pd
from db import get_engine

def read_table(table: str) -> pd.DataFrame:
    """Read an entire table from PostgreSQL into a DataFrame."""
    result = pd.read_sql(f"SELECT * FROM {table}", get_engine())
    return result

def year_over_year_change(df: pd.DataFrame, indicator:str) -> pd.DataFrame:
    """Filter to one indicator, sort by year, compute year-over-year change."""
    
    filtered = df[df["indicator_name"] == indicator].sort_values("year").copy()
    filtered["change"] = filtered["value"].diff()
    return filtered

def summarize_indicator(df:pd.DataFrame, indicator:str) -> dict:
    """Condense a year-over-year DataFrame into headline stats."""
    result = year_over_year_change(df, indicator)
    latest_year = int(result.iloc[-1]["year"])
    latest_value = float(result.iloc[-1]["value"])
    change = float(result.iloc[-1]["change"])
    average = float(result["value"].mean())
    max_value = float(result["value"].max())
    min_value = float(result["value"].min())
    recent_avg = float(result.tail(3)["value"].mean())
    older_avg = float(result.iloc[:-3]["value"].mean())
    if recent_avg > older_avg:
        trend = "ascend"
    else:
        trend = "descend"

    return {"indicator":indicator,"latest_year":latest_year, "latest_value":latest_value, "change":change, "average":average, "max":max_value, "min":min_value, "recent_avg": recent_avg, "older_avg":older_avg,"trend": trend}

def summarize_housing_sale_price(df:pd.DataFrame) -> dict:
    
    nz_p = df[df["area_name"] == "New Zealand"].sort_values("year")
    nz_p = nz_p.copy()
    nz_p["price_change"] = nz_p["price_per_m2"].diff()
    price_per_m2_over_year = float(nz_p.iloc[-1]["price_change"])
    latest_year = int(nz_p.iloc[-1]["year"])
    Latest_price_per_m2 = float(nz_p.iloc[-1]["price_per_m2"])
    max_value_p = float(nz_p["price_per_m2"].max())
    min_value_p = float(nz_p["price_per_m2"].min())
    average_p = float(nz_p["price_per_m2"].mean())
    latest_avg_price = float(nz_p["sum_sale_price"].iloc[-1] / nz_p["number_sales"].iloc[-1]) 

    return {"price_per_m2_over_year": price_per_m2_over_year,"latest_year": latest_year,"Latest_price_per_m2":Latest_price_per_m2,"max_value_p": max_value_p,"min_value_p":min_value_p,"average_p":average_p,"latest_avg_price":latest_avg_price}

def summarize_housing_affordability(df: pd.DataFrame) -> dict:
    """Condense NZ-level affordability indices into headline stats."""
    data = df[df["area_name"] == "New Zealand"].sort_values("record_date")
    date = data["record_date"].iloc[-1].strftime("%Y-%m-%d")
    indices = {
        "mortgage": "mortgage_affordability_index",
        "deposit": "deposit_affordability_index",
        "rent": "rent_affordability_index",
    }
    result = {"date": date}
    for name, column in indices.items():
        result[f"{name}_latest"] = float(data[column].iloc[-1])
        result[f"{name}_average"] = float(data[column].mean())
    return result

def summarize_bank_rate(df:pd.DataFrame) -> dict:
    """1/3/5 year rate as basis. Current term deposit rates by term - no history, just latest snapshot."""
    bank = df["bank"].iloc[-1]
    rates = []
    for term in ["1 year", "3 year", "5 year"]:
        row = df[df["term"] == term].iloc[0]
        rates.append({
            "term":term,
            "rate": float(row["rate"]),
            "date": row["fetched_at"].strftime("%Y-%m-%d"),       
                      }) 
    return {"bank": bank,"rates": rates}

def summarize_fx_rates(df: pd.DataFrame) -> dict:
    """Current NZD exchange rates - no history stored, just the latest snapshot."""
    base = df["base_currency"].iloc[0]
    date = df["rate_date"].iloc[0].strftime("%Y-%m-%d")
    rates = {currency: float(rate) for currency, rate in zip(df["target_currency"], df["rate"])}
    return {"base_currency": base, "date": date, "rates": rates}

def get_all_summaries() -> dict:
    "get all economic data for analyze"
    result = read_table("economic_indicators")
    economic =[]
    for indicator in ["inflation_rate", "gdp_growth_rate", "unemployment_rate"]:
        economic.append(summarize_indicator(result, indicator))

    house_price = read_table("housing_sale_price")
    hp = summarize_housing_sale_price(house_price)

    housing_affordability = read_table("housing_affordability")
    ha = summarize_housing_affordability(housing_affordability)

    bank_rate = read_table("bank_rates")
    br = summarize_bank_rate(bank_rate)

    fx = read_table("fx_rates")
    fr = summarize_fx_rates(fx)

    return {"economic": economic, "housing_price":hp, "affordability":ha, "bank_rate":br, "fx":fr}


if __name__ == "__main__":
    result = read_table("economic_indicators")
    for indicator in ["inflation_rate", "gdp_growth_rate", "unemployment_rate"]:
        print(summarize_indicator(result, indicator))

    house_price = read_table("housing_sale_price")
    print(summarize_housing_sale_price(house_price))

    housing_affordability = read_table("housing_affordability")
    print(summarize_housing_affordability(housing_affordability))

    bank_rate = read_table("bank_rates")
    print(summarize_bank_rate(bank_rate))

    fx = read_table("fx_rates")
    print(summarize_fx_rates(fx))