import EChartsReact from "echarts-for-react"
import type { PriceTrendPayload } from "../types/MarketInsight"
import { seriesColors } from "../styles/chartColors"
import { chartBase, axisLineStyle, splitLineStyle } from "../styles/chartTheme"
import { formatCompact } from "../utils/format"

export default function PriceTrendChart({ data }: { data: PriceTrendPayload }) {
    const option = {
        ...chartBase('Real vs Nominal House Price', `NZD per m² · real series in ${data.base_year} dollars`),
        grid: { top: 75, left: 50, right: 30, bottom: 70, containLabel: true },
        xAxis: { type: 'category', data: data.years, axisLine: axisLineStyle },
        yAxis: {
            type: 'value', name: 'NZD per m2', nameLocation: 'middle', nameGap: 40,
            axisLine: axisLineStyle, splitLine: splitLineStyle, axisLabel: { formatter: formatCompact }
        },
        legend: { bottom: 0, textStyle: { color: '#53565c' } },
        series: [
            { name: 'Nominal', type: 'line', data: data.nominal_price_per_m2, color: seriesColors[1] },
            { name: 'Real (inflation-adjusted)', type: 'line', data: data.real_price_per_m2, color: seriesColors[3] },
        ]
    }
    return <EChartsReact option={option} />
}