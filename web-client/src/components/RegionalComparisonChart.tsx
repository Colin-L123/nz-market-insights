import EChartsReact from "echarts-for-react"
import type { RegionalComparisonPayload } from "../types/MarketInsight"
import { seriesGradientsHorizontal } from "../styles/chartColors"
import { chartBase, axisLineStyle, splitLineStyle } from "../styles/chartTheme"
import { formatCompact } from "../utils/format"

export default function RegionalComparisonChart({ data }: { data: RegionalComparisonPayload }) {
    const sorted = [...data.cities].sort((a, b) => b.price_per_m2 - a.price_per_m2)
    const cities = sorted.map(c => c.area_name)
    const prices = sorted.map(c => c.price_per_m2)

    const option = {
        ...chartBase('House Price by City', `NZD per m², ${data.year}`),
        grid: { top: 70, left: 130, right: 30, bottom: 40, containLabel: true },
        xAxis: { type: 'value', axisLine: axisLineStyle, splitLine: splitLineStyle, axisLabel: { formatter: formatCompact } },
        yAxis: { type: 'category', data: cities, axisLine: axisLineStyle, inverse: true },
        series: [{ type: 'bar', data: prices, color: seriesGradientsHorizontal[0] }]
    }
    return <EChartsReact option={option} />
}