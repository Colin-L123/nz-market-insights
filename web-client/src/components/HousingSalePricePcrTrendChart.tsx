import EChartsReact from "echarts-for-react"
import type { HousingSalePrice } from "../types/HousingSalePrice"
import { seriesColors } from "../styles/chartColors"
import { chartBase, axisLineStyle, splitLineStyle } from "../styles/chartTheme"

const majorCities = ["Auckland", "Wellington City", "Christchurch City", "Hamilton City", "Dunedin City", "Tauranga City"]

export default function HousingSalePricePcrTrendChart({ data }: { data: HousingSalePrice[] }) {
    const filtered = data.filter(d => majorCities.includes(d.areaName) && d.year !== 2026 && d.pcr != null)
    const years = [...new Set(filtered.map(d => d.year))].sort((a, b) => a - b)
    const areas = [...new Set(filtered.map(d => d.areaName))]

    const series = areas.map((area, index) => ({
        name: area,
        type: 'line',
        color: seriesColors[index],
        data: years.map(year => {
            const point = filtered.find(d => d.areaName === area && d.year === year)
            return point ? point.pcr : null
        })
    }))

    const option = {
        ...chartBase('Price-Cost Ratio (PCR) Trend by City', 'Over time, excluding incomplete 2026 data'),
        legend: { data: areas, top: 65 },
        grid: { top: 115, left: 60, right: 30, bottom: 50, containLabel: true },
        xAxis: { type: 'category', data: years, axisLine: axisLineStyle },
        yAxis: { type: 'value', name: 'PCR', nameLocation: 'middle', nameGap: 40, axisLine: axisLineStyle, splitLine: splitLineStyle },
        series: series
    }
    return (
        <div>
            <EChartsReact option={option} />
            <p style={{ fontSize: '0.85em', color: '#898781' }}>
                PCR = Price per m² ÷ Cost per m² (of new builds). Higher = buying an existing home costs more than building new (land value premium); lower = building new is relatively pricier.<br />
                PCR = 每平米成交价 ÷ 每平米建造成本。数值越高，说明买现房比自建更贵（地价溢价越大）；越低则说明新建相对更贵。
            </p>
        </div>
    )
}