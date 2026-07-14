from fetch_bank_rates import fetch_page as fetch_bnz_page, parse_prices, BNZ_API_URL
from fetch_fx import fetch_page as fetch_fx_rate, FX_API_URL
from fetch_worldbank import fetch_all_indicators
from fetch_housing import fetch_page as fetch_housing_page, parse_csv, AFFORADBILITY_CSV_URL, SALE_PRICE_CSV_URL

from datetime import datetime
from db import replace_table

def load_bank_rates():
    """Fetch + transform + load BNZ bank rates into bank_rates table."""
    rates_inital = fetch_bnz_page(BNZ_API_URL)
    rates_par = parse_prices(rates_inital)
    # print (rates_par)
    rows = []
    for r in rates_par:
        rows.append(("BNZ",r["term"],r["rate"],datetime.now()))

    replace_table("bank_rates",["bank","term","rate","fetched_at"],rows)

def load_fx_rates():
    """Fetch rxchange rate for USD,EUR,CNY,AUD,GBP,JPY,SGD"""
    fx_rate = fetch_fx_rate(FX_API_URL)
    rows = []
    for currency, rate in fx_rate["rates"].items():
        rows.append((fx_rate["base"],currency,rate,fx_rate["date"],datetime.now()))
    replace_table("fx_rates",["base_currency","target_currency","rate","rate_date","fetched_at"],rows)

def load_economic_indicators():
    """fetch world bank indicators"""
    indicators = fetch_all_indicators()
    result = []
    for name, rows in indicators.items():
        for row in rows:
           result.append((name, row["year"],row[name]))
    replace_table("economic_indicators",["indicator_name","year","value"],result)

def load_housing():
    """fetch housing indicators and factors"""
    affordability = parse_csv(fetch_housing_page(AFFORADBILITY_CSV_URL))
    sale_prices = parse_csv(fetch_housing_page(SALE_PRICE_CSV_URL))
    aff = []
    sale = []
    for a in affordability:
        aff.append((a["Area_Name"],a["Area_Type"],a["date"],a["Mortgage Affordability Index"],a["Deposit Affordability Index"],a["Rent Affordability Index"]))
    for s in sale_prices:
        sale.append((s["Year"],s["Area_Name"],s["Area_Code"],s["Area_Type"],s["Sum_Floor_Area_Sold"],s["Sum_Sale_Price"],s["Number_Sales"],s["Price_Per_m2"],na_to_none(s["Number_BC"]),na_to_none(s["Cost_Per_m2"]),na_to_none(s["Sum_Value_New"]),na_to_none(s["PCR"])))
    replace_table("housing_affordability", ["area_name","area_type","record_date","mortgage_affordability_index","deposit_affordability_index","rent_affordability_index"], aff)
    replace_table("housing_sale_price", ["year","area_name","area_code","area_type","sum_floor_area_sold","sum_sale_price","number_sales","price_per_m2","number_bc","cost_per_m2","sum_value_new","pcr"],sale)

def na_to_none(value):
    """Convert the CSV placeholder 'NA' into a real NULL for the database."""
    return None if value == "NA" else value

    
if __name__ == "__main__":
    load_bank_rates()
    load_fx_rates()
    load_economic_indicators()
    load_housing()