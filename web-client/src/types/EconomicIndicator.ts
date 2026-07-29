export interface EconomicIndicator {
    id: number;
    indicatorName: string;
    year: number;
    value: number;
}

export const indicatorLabels: Record<string, string> = {
    inflation_rate: "Inflation Rate",
    gdp_growth_rate: "GDP Growth Rate",
    unemployment_rate: "Unemployment Rate",
}