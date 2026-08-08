"""Compute the derived "Market Insights" shown on the homepage.

Each function here mirrors an analysis already validated in
notebooks/deep_analysis.ipynb, adapted to run as part of the regular
data pipeline (not interactively) and to write its result into the
market_insights table for the API to serve.
"""
import json
import pandas as pd
from db import get_engine, upsert_insight


def _records(df: pd.DataFrame) -> list[dict]:
    """DataFrame -> list of plain-Python-typed dicts, safe for json.dumps().

    pandas .to_dict(orient="records") can leave numpy scalar types (e.g. numpy.float64)
    inside the dicts, which json.dumps() can't serialize (same numpy/JSON issue noted in
    Phase 2 of ROADMAP.md). Round-tripping through pandas' own .to_json() sidesteps it,
    since pandas already knows how to convert its own numpy types correctly.
    """
    return json.loads(df.to_json(orient="records"))


def _economic_wide(engine) -> pd.DataFrame:
    return pd.read_sql("""
        SELECT
            year,
            MAX(CASE WHEN indicator_name = 'inflation_rate' THEN value END) AS inflation_rate,
            MAX(CASE WHEN indicator_name = 'gdp_growth_rate' THEN value END) AS gdp_growth_rate,
            MAX(CASE WHEN indicator_name = 'unemployment_rate' THEN value END) AS unemployment_rate
        FROM economic_indicators
        GROUP BY year
        ORDER BY year
    """, engine)


def _combined(engine) -> pd.DataFrame:
    """Same national, annual economic+housing table built in the notebook, plus real price and affordability."""
    combined = pd.read_sql("""
        WITH economic_wide AS (
            SELECT
                year,
                MAX(CASE WHEN indicator_name = 'inflation_rate' THEN value END) AS inflation_rate,
                MAX(CASE WHEN indicator_name = 'gdp_growth_rate' THEN value END) AS gdp_growth_rate,
                MAX(CASE WHEN indicator_name = 'unemployment_rate' THEN value END) AS unemployment_rate
            FROM economic_indicators
            GROUP BY year
        )
        SELECT
            e.year, e.inflation_rate, e.gdp_growth_rate, e.unemployment_rate,
            h.sum_sale_price, h.number_sales, h.price_per_m2, h.pcr
        FROM economic_wide e
        JOIN housing_sale_price h ON e.year = h.year
        WHERE h.area_type = 'NZ' AND h.year != 2026
        ORDER BY e.year
    """, engine)

    combined["avg_price_per_house"] = combined["sum_sale_price"] / combined["number_sales"]
    combined["cpi_index"] = (1 + combined["inflation_rate"] / 100).cumprod() * 100
    combined["real_price_per_m2"] = combined["price_per_m2"] / (combined["cpi_index"] / 100)

    affordability_nz = pd.read_sql("SELECT * FROM housing_affordability WHERE area_type = 'NZ' ORDER BY record_date", engine)
    affordability_nz["record_date"] = pd.to_datetime(affordability_nz["record_date"])
    affordability_nz["year"] = affordability_nz["record_date"].dt.year
    affordability_yearly = affordability_nz.groupby("year")[
        ["mortgage_affordability_index", "deposit_affordability_index", "rent_affordability_index"]
    ].mean().reset_index()

    return combined.merge(affordability_yearly, on="year", how="inner")


def compute_price_trend(combined: pd.DataFrame) -> dict:
    return {
        "years": combined["year"].astype(int).tolist(),
        "nominal_price_per_m2": combined["price_per_m2"].round(2).tolist(),
        "real_price_per_m2": combined["real_price_per_m2"].round(2).tolist(),
        "base_year": int(combined["year"].min()),
    }


def compute_pcr_vs_average(combined: pd.DataFrame) -> dict:
    pcr_mean = combined["pcr"].mean()
    pcr_std = combined["pcr"].std()
    current_pcr = combined["pcr"].iloc[-1]
    return {
        "year": int(combined["year"].iloc[-1]),
        "current_pcr": round(float(current_pcr), 3),
        "average_pcr": round(float(pcr_mean), 3),
        "std_dev": round(float(pcr_std), 3),
        "z_score": round(float((current_pcr - pcr_mean) / pcr_std), 2),
        "pct_vs_average": round(float((current_pcr / pcr_mean - 1) * 100), 1),
    }


def compute_drawdown_from_peak(combined: pd.DataFrame) -> dict:
    running_peak = combined["real_price_per_m2"].cummax()
    drawdown_pct = (combined["real_price_per_m2"] / running_peak - 1) * 100
    peak_idx = combined["real_price_per_m2"].idxmax()
    return {
        "peak_year": int(combined["year"].loc[peak_idx]),
        "peak_real_price_per_m2": round(float(combined["real_price_per_m2"].max()), 2),
        "current_year": int(combined["year"].iloc[-1]),
        "current_drawdown_pct": round(float(drawdown_pct.iloc[-1]), 1),
    }


def compute_volatility(combined: pd.DataFrame) -> dict:
    pct_change = combined["price_per_m2"].pct_change() * 100
    return {
        "average_annual_growth_pct": round(float(pct_change.mean()), 2),
        "volatility_std_dev_pct": round(float(pct_change.std()), 2),
        "period": f"{int(combined['year'].iloc[0])}-{int(combined['year'].iloc[-1])}",
    }


def compute_capital_allocation(combined: pd.DataFrame, engine) -> dict:
    years_span = int(combined["year"].iloc[-1] - combined["year"].iloc[0])
    property_real_cagr = ((combined["real_price_per_m2"].iloc[-1] / combined["real_price_per_m2"].iloc[0]) ** (1 / years_span) - 1) * 100

    current_bank_rates = pd.read_sql("""
        SELECT DISTINCT ON (bank, term) bank, term, rate
        FROM bank_rates ORDER BY bank, term, fetched_at DESC
    """, engine)
    deposit_1yr = current_bank_rates.loc[current_bank_rates["term"] == "1 year", "rate"].values[0]
    current_inflation = combined["inflation_rate"].iloc[-1]

    return {
        "years_span": years_span,
        "property_real_cagr_pct": round(float(property_real_cagr), 2),
        "term_deposit_real_return_pct": round(float(deposit_1yr - current_inflation), 2),
        "cash_real_return_pct": round(float(-current_inflation), 2),
    }


def compute_rate_spread(engine) -> dict:
    def term_to_days(term):
        term = term.strip().lower()
        if term == "variable":
            return None
        num_str, unit = term.split(" ")
        num = float(num_str)
        if unit.startswith("day"):
            return num
        if unit.startswith("month"):
            return num * 30
        if unit.startswith("year"):
            return num * 365
        return None

    bank_rates = pd.read_sql("""
        SELECT DISTINCT ON (bank, term) bank, term, rate
        FROM bank_rates ORDER BY bank, term, fetched_at DESC
    """, engine)
    loan_rates = pd.read_sql("""
        SELECT DISTINCT ON (bank, product, term) bank, product, term, rate
        FROM loan_rates ORDER BY bank, product, term, fetched_at DESC
    """, engine)

    bank_rates["days"] = bank_rates["term"].apply(term_to_days)
    loan_rates["days"] = loan_rates["term"].apply(term_to_days)

    spread = bank_rates[["term", "days", "rate"]].rename(columns={"rate": "deposit_rate", "term": "deposit_term"}).merge(
        loan_rates[loan_rates["product"] == "Standard"][["term", "days", "rate"]].rename(columns={"rate": "loan_rate", "term": "loan_term"}),
        on="days", how="inner",
    )
    spread["spread"] = spread["loan_rate"] - spread["deposit_rate"]
    spread = spread.sort_values("days")

    return {"terms": _records(spread[["deposit_term", "deposit_rate", "loan_rate", "spread"]].round(2))}


def compute_regional_comparison(combined: pd.DataFrame, engine) -> dict:
    major_cities = ["Auckland", "Wellington City", "Christchurch City", "Hamilton City", "Dunedin City", "Tauranga City"]
    latest_year = int(combined["year"].iloc[-1])

    regional_price = pd.read_sql("""
        SELECT area_name, price_per_m2, pcr, number_sales
        FROM housing_sale_price
        WHERE area_type = 'TA' AND area_name = ANY(%(cities)s) AND year = %(year)s
    """, engine, params={"cities": major_cities, "year": latest_year})

    regional_affordability = pd.read_sql("""
        SELECT area_name,
               AVG(mortgage_affordability_index) AS mortgage_affordability_index,
               AVG(deposit_affordability_index) AS deposit_affordability_index,
               AVG(rent_affordability_index) AS rent_affordability_index
        FROM housing_affordability
        WHERE area_type = 'TA' AND area_name = ANY(%(cities)s) AND EXTRACT(YEAR FROM record_date) = %(year)s
        GROUP BY area_name
    """, engine, params={"cities": major_cities, "year": latest_year})

    regional = regional_price.merge(regional_affordability, on="area_name").sort_values("price_per_m2", ascending=False)
    return {"year": latest_year, "cities": _records(regional.round(3))}


def compute_unemployment_affordability(combined: pd.DataFrame) -> dict:
    from scipy import stats

    def regress(x, y):
        slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)
        return {"r_squared": round(float(r_value ** 2), 3), "p_value": round(float(p_value), 4)}

    x = combined["unemployment_rate"]
    return {
        "deposit": regress(x, combined["deposit_affordability_index"]),
        "mortgage": regress(x, combined["mortgage_affordability_index"]),
        "rent": regress(x, combined["rent_affordability_index"]),
    }


def main():
    engine = get_engine()
    combined = _combined(engine)

    upsert_insight("price_trend", compute_price_trend(combined))
    upsert_insight("pcr_vs_average", compute_pcr_vs_average(combined))
    upsert_insight("drawdown_from_peak", compute_drawdown_from_peak(combined))
    upsert_insight("volatility", compute_volatility(combined))
    upsert_insight("capital_allocation", compute_capital_allocation(combined, engine))
    upsert_insight("rate_spread", compute_rate_spread(engine))
    upsert_insight("regional_comparison", compute_regional_comparison(combined, engine))
    upsert_insight("unemployment_affordability", compute_unemployment_affordability(combined))
    print("Wrote 8 market insights.")


if __name__ == "__main__":
    main()