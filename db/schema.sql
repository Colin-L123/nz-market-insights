-- 文件开头可以写一行注释说明用途，SQL 里注释用 --
-- 表1 bank_rates:      id(主键) / bank(text) / term(text) / rate(numeric) / fetched_at(timestamp)
CREATE TABLE IF NOT EXISTS bank_rates(
    id SERIAL PRIMARY KEY,
    bank text,
    term text,
    rate numeric,
    fetched_at timestamp
);
-- 表2 fx_rates:        id(主键) / base_currency(text) / target_currency(text) / rate(numeric) / rate_date(date) / fetched_at(timestamp)
CREATE TABLE IF NOT EXISTS fx_rates(
    id serial primary key,
    base_currency text,
    target_currency text,
    rate numeric,
    rate_date date,
    fetched_at timestamp
);
 -- 表3 housing_affordability: id(主键) / area_name(text) / area_type(text) / record_date(date) / mortgage_affordability_index(numeric) / deposit_affordability_index(numeric) / rent_affordability_index(numeric)
CREATE TABLE IF NOT EXISTS housing_affordability(
    id serial primary key,
    area_name text,
    area_type text,
    record_date date,
    mortgage_affordability_index numeric,
    deposit_affordability_index numeric,
    rent_affordability_index numeric
);
 -- 表4 housing_sale_price:    id(主键) / year(integer) / area_name(text) / area_code(text) / area_type(text) / sum_floor_area_sold(numeric) / sum_sale_price(numeric) / number_sales(integer) / price_per_m2(numeric) / number_bc(numeric) / cost_per_m2(numeric) / sum_value_new(numeric) / pcr(numeric)
CREATE TABLE IF NOT EXISTS housing_sale_price(
    id serial primary key,
    year integer,
    area_name text,
    area_code text,
    area_type text,
    sum_floor_area_sold numeric,
    sum_sale_price numeric,
    number_sales integer,
    price_per_m2 numeric,
    number_bc numeric,
    cost_per_m2 numeric,
    sum_value_new numeric,
    pcr numeric
);
 -- 表5 economic_indicators:   id(主键) / indicator_name(text) / year(integer) / value(numeric)
CREATE TABLE IF NOT EXISTS economic_indicators(
    id serial primary key,
    indicator_name text,
    year integer,
    value numeric
);