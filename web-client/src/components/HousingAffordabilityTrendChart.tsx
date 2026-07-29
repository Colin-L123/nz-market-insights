import EChartsReact from "echarts-for-react"
import type { HousingAffordability } from "../types/HousingAffordability"
import { seriesColors } from "../styles/chartColors"
import { chartBase, axisLineStyle, splitLineStyle } from "../styles/chartTheme"
import { affordabilityMetrics, affordabilityValue, type AffordabilityMetric } from "./housingAffordabilityMetrics"

const majorCities = ["Auckland", "Wellington City", "Christchurch City", "Hamilton City", "Dunedin City", "Tauranga City"]

export default function HousingAffordabilityTrendChart({ data, metric }: { data: HousingAffordability[], metric: AffordabilityMetric }) {
    const config = affordabilityMetrics[metric]
    const filtered = data.filter(d => majorCities.includes(d.areaName))
    const dates = [...new Set(filtered.map(d => d.recordDate))].sort()
    const areas = [...new Set(filtered.map(d => d.areaName))]

    const series = areas.map((area, index) => ({
        name: area,
        type: 'line',
        color: seriesColors[index],
        data: dates.map(date => {
            const point = filtered.find(d => d.areaName === area && d.recordDate === date)
            return point ? affordabilityValue(point, metric) : null
        })
    }))

    const option = {
        ...chartBase(`Housing Affordability Trend by City — ${config.label}`, 'Over time'),
        legend: { data: areas, top: 65 },
        grid: { top: 115, left: 60, right: 30, bottom: 50, containLabel: true },
        xAxis: { type: 'category', data: dates, axisLine: axisLineStyle },
        yAxis: { type: 'value', name: config.label, nameLocation: 'middle', nameGap: 40, axisLine: axisLineStyle, splitLine: splitLineStyle },
        series: series
    }
    return (
        <div>
            <EChartsReact option={option} />
            <p style={{ fontSize: '0.85em', color: '#898781' }}>
                {config.captionEn}<br />{config.captionCn}
            </p>
        </div>
    )
}