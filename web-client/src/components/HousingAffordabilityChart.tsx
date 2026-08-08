import EChartsReact from "echarts-for-react"
import type { HousingAffordability } from "../types/HousingAffordability"
import { seriesGradients } from "../styles/chartColors"
import { chartBase, axisLineStyle, splitLineStyle } from "../styles/chartTheme"
import { affordabilityMetrics, affordabilityValue, type AffordabilityMetric } from "./housingAffordabilityMetrics"

export default function HousingAffordabilityChart({ data, metric }: { data: HousingAffordability[], metric: AffordabilityMetric }) {
    const config = affordabilityMetrics[metric]
    const latestDate = data.reduce((max, d) => d.recordDate > max ? d.recordDate : max, '')
    const latest = data.filter(d => d.recordDate === latestDate)

    const areas = latest.map(d => d.areaName)
    const values = latest.map(d => affordabilityValue(d, metric))

    const option = {
        ...chartBase(`Housing Affordability by City — ${config.label}`, 'Latest available date'),
        grid: { top: 70, left: 60, right: 30, bottom: 50, containLabel: true },
        xAxis: { type: 'category', data: areas, axisLine: axisLineStyle },
        yAxis: { type: 'value', name: config.label, nameLocation: 'middle', nameGap: 40, axisLine: axisLineStyle, splitLine: splitLineStyle },
        series: [{ type: 'bar', data: values, color: seriesGradients[config.gradientIndex] }]
    }
    return (
        <div>
            <EChartsReact option={option} />
            <p style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>
                {config.captionEn}<br />{config.captionCn}
            </p>
        </div>
    )
}