import EChartsReact from "echarts-for-react"
import type { HousingSalePrice } from "../types/HousingSalePrice"
import { seriesColors } from "../styles/chartColors"
import { chartBase, axisLineStyle, splitLineStyle } from "../styles/chartTheme"

const majorCities = ["Auckland", "Wellington City", "Christchurch City", "Hamilton City", "Dunedin City", "Tauranga City"]

export default function HousingSalePriceVolumeChart({ data }: { data: HousingSalePrice[] }) {
    const filtered = data.filter(d => majorCities.includes(d.areaName) && d.year !== 2026)
    const years = [...new Set(filtered.map(d => d.year))].sort((a, b) => a - b)
    const areas = [...new Set(filtered.map(d => d.areaName))]

    const series = areas.map((area, index) => ({
        name: area,
        type: 'line',
        color: seriesColors[index],
        data: years.map(year => {
            const point = filtered.find(d => d.areaName === area && d.year === year)
            return point ? point.numberSales : null
        })
    }))

    const option = {
        ...chartBase('Annual Sales Volume by City', 'Number of properties sold per year, excluding incomplete 2026 data'),
        legend: { data: areas, top: 65 },
        grid: { top: 115, left: 50, right: 30, bottom: 50, containLabel: true },
        xAxis: { type: 'category', data: years, axisLine: axisLineStyle },
        yAxis: { type: 'value', name: 'Number of Sales', nameLocation: 'middle', nameGap: 50, axisLine: axisLineStyle, splitLine: splitLineStyle },
        series: series
    }
    return <EChartsReact option={option} />
}
