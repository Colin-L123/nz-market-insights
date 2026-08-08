import EChartsReact from "echarts-for-react";
import { indicatorLabels, type EconomicIndicator } from "../types/EconomicIndicator";
import { seriesColors } from "../styles/chartColors"
import { chartBase, axisLineStyle, splitLineStyle } from "../styles/chartTheme"

export default function EconomicIndicatorChart({ data }: { data: EconomicIndicator[] }) {
    const years = [...new Set(data.map(d => d.year))].sort((a, b) => a - b)
    const indicatorNames = [...new Set(data.map(d => d.indicatorName))]
    
    const series = indicatorNames.map((name, index) => ({
        name: indicatorLabels[name] ?? name,
        type: 'line',
        color: seriesColors[index],
        data: years.map(year => {
            const point = data.find(d => d.indicatorName === name && d.year === year)
            return point ? point.value : null
        })
    }))
    const option = {
    ...chartBase('Key Economic Indicators Over Time', 'Inflation, GDP growth, and unemployment rate (%)'),
    legend: { data: indicatorNames.map(name => indicatorLabels[name] ?? name), top: 65 },
    grid: { top: 115, left: 60, right: 30, bottom: 50, containLabel: true },
    xAxis: { type: 'category', data: years, axisLine: axisLineStyle },
    yAxis: { type: 'value', name: 'Percent (%)', nameLocation: 'middle', nameGap: 40, axisLine: axisLineStyle, splitLine: splitLineStyle },
    series: series
}

    return <EChartsReact option={option} />
}