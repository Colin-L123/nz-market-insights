export interface MarketInsight {
    id: number
    insightKey: string
    computedAt: string
    payload: unknown
}

// payload 内部字段是 data-service/src/compute_insights.py 直接写进数据库的原始 JSON，
// 不会经过 C# 的 PascalCase->camelCase 自动转换，所以这里保持跟 Python 一致的 snake_case。

export interface PriceTrendPayload {
    years: number[]
    nominal_price_per_m2: number[]
    real_price_per_m2: number[]
    base_year: number
}

export interface PcrVsAveragePayload {
    year: number
    current_pcr: number
    average_pcr: number
    std_dev: number
    z_score: number
    pct_vs_average: number
}

export interface DrawdownFromPeakPayload {
    peak_year: number
    peak_real_price_per_m2: number
    current_year: number
    current_drawdown_pct: number
}

export interface VolatilityPayload {
    average_annual_growth_pct: number
    volatility_std_dev_pct: number
    period: string
}

export interface CapitalAllocationPayload {
    years_span: number
    property_real_cagr_pct: number
    term_deposit_real_return_pct: number
    cash_real_return_pct: number
}

export interface RateSpreadPayload {
    terms: {
        deposit_term: string
        deposit_rate: number
        loan_rate: number
        spread: number
    }[]
}

export interface RegionalComparisonPayload {
    year: number
    cities: {
        area_name: string
        price_per_m2: number
        pcr: number
        number_sales: number
        mortgage_affordability_index: number
        deposit_affordability_index: number
        rent_affordability_index: number
    }[]
}

export interface UnemploymentAffordabilityPayload {
    deposit: { r_squared: number; p_value: number }
    mortgage: { r_squared: number; p_value: number }
    rent: { r_squared: number; p_value: number }
}