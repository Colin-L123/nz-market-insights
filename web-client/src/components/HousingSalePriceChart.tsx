import EChartsReact from "echarts-for-react"
import type { HousingSalePrice } from "../types/HousingSalePrice"
import { seriesColors } from "../styles/chartColors"
import { chartBase, axisLineStyle, splitLineStyle } from "../styles/chartTheme"

const majorCities = ["Auckland", "Wellington City", "Christchurch City", "Hamilton City", "Dunedin City", "Tauranga City"]

export default function HousingSalePriceChart({ data }: { data: HousingSalePrice[] }) {
    const filtered = data.filter(d => majorCities.includes(d.areaName) && d.year !== 2026 && d.numberSales > 0)
    const latestYear = Math.max(...filtered.map(d => d.year))
    const latest = filtered.filter(d => d.year === latestYear)

    const areas = latest.map(d => d.areaName)
    const values = latest.map(d => Math.round(d.sumSalePrice / d.numberSales))

    const option = {
        ...chartBase('Average House Price by City', 'NZD per property, latest complete year'),
        grid: { top: 70, left: 70, right: 30, bottom: 50, containLabel: true },
        xAxis: { type: 'category', data: areas, axisLine: axisLineStyle },
        yAxis: { type: 'value', name: 'Average Price (NZD)', nameLocation: 'middle', nameGap: 60, axisLine: axisLineStyle, splitLine: splitLineStyle },
        series: [{ type: 'bar', data: values, color: seriesColors[3] }]
    }
    return <EChartsReact option={option} />
}
