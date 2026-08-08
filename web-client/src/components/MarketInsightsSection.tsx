import '../App.css'
import './MarketInsightsSection.css'
import type {
    MarketInsight, PriceTrendPayload, PcrVsAveragePayload, DrawdownFromPeakPayload,
    VolatilityPayload, CapitalAllocationPayload, RateSpreadPayload,
    RegionalComparisonPayload, UnemploymentAffordabilityPayload
} from "../types/MarketInsight"
import InsightStatCard from "./InsightStatCard"
import PriceTrendChart from "./PriceTrendChart"
import CapitalAllocationChart from "./CapitalAllocationChart"
import RateSpreadTable from "./RateSpreadTable"
import RegionalComparisonChart from "./RegionalComparisonChart"
import UnemploymentAffordabilityTable from "./UnemploymentAffordabilityTable"

function findPayload<T>(insights: MarketInsight[], key: string): T | undefined {
    return insights.find(i => i.insightKey === key)?.payload as T | undefined
}

export default function MarketInsightsSection({ data }: { data: MarketInsight[] }) {
    const priceTrend = findPayload<PriceTrendPayload>(data, 'price_trend')
    const pcrVsAverage = findPayload<PcrVsAveragePayload>(data, 'pcr_vs_average')
    const drawdown = findPayload<DrawdownFromPeakPayload>(data, 'drawdown_from_peak')
    const volatility = findPayload<VolatilityPayload>(data, 'volatility')
    const capitalAllocation = findPayload<CapitalAllocationPayload>(data, 'capital_allocation')
    const rateSpread = findPayload<RateSpreadPayload>(data, 'rate_spread')
    const regional = findPayload<RegionalComparisonPayload>(data, 'regional_comparison')
    const unemploymentAffordability = findPayload<UnemploymentAffordabilityPayload>(data, 'unemployment_affordability')

    return (
        <div className="insights-grid">
            {pcrVsAverage && (
                <InsightStatCard
                    title="Is Property Expensive Right Now?"
                    value={`${pcrVsAverage.pct_vs_average > 0 ? '+' : ''}${pcrVsAverage.pct_vs_average}%`}
                    subtitle={`vs its own 20-year average · current price-cost ratio ${pcrVsAverage.current_pcr}`}
                    positive={pcrVsAverage.pct_vs_average < 0}
                />
            )}
            {drawdown && (
                <InsightStatCard
                    title="Distance From All-Time High"
                    value={`${drawdown.current_drawdown_pct}%`}
                    subtitle={`vs the ${drawdown.peak_year} peak, real (inflation-adjusted) price`}
                />
            )}
            {volatility && (
                <InsightStatCard
                    title="Price Volatility"
                    value={`±${volatility.volatility_std_dev_pct}pp`}
                    subtitle={`year-over-year swing, vs average growth of ${volatility.average_annual_growth_pct}%/yr (${volatility.period})`}
                />
            )}
            {priceTrend && <div className="insights-chart-tile glass-card"><PriceTrendChart data={priceTrend} /></div>}
            {capitalAllocation && <div className="insights-chart-tile glass-card"><CapitalAllocationChart data={capitalAllocation} /></div>}
            {regional && <div className="insights-chart-tile glass-card"><RegionalComparisonChart data={regional} /></div>}
            {rateSpread && <RateSpreadTable data={rateSpread} />}
            {unemploymentAffordability && <UnemploymentAffordabilityTable data={unemploymentAffordability} />}
        </div>
    )
}