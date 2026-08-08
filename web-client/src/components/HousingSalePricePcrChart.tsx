import EChartsReact from "echarts-for-react"
import type { HousingSalePrice } from "../types/HousingSalePrice"
import { seriesGradients } from "../styles/chartColors"
import { chartBase, axisLineStyle, splitLineStyle } from "../styles/chartTheme"
import { majorCities } from "../constants"

export default function HousingSalePricePcrChart({ data }: { data: HousingSalePrice[] }) {
    const filtered = data.filter(d => majorCities.includes(d.areaName) && d.areaType === 'TA' && d.year !== 2026 && d.pcr != null)
    const latestYear = Math.max(...filtered.map(d => d.year))
    const latest = filtered.filter(d => d.year === latestYear)

    const areas = latest.map(d => d.areaName)
    const values = latest.map(d => d.pcr)

    const option = {
        ...chartBase('Price-Cost Ratio (PCR) by City', 'Latest complete year'),
        grid: { top: 70, left: 60, right: 30, bottom: 50, containLabel: true },
        xAxis: { type: 'category', data: areas, axisLine: axisLineStyle },
        yAxis: { type: 'value', name: 'PCR', nameLocation: 'middle', nameGap: 40, axisLine: axisLineStyle, splitLine: splitLineStyle },
        series: [{ type: 'bar', data: values, color: seriesGradients[1] }] // cyan — secondary metric paired with the blue "Average House Price" chart
    }
    return (
        <div>
            <EChartsReact option={option} />
            <p style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>
                PCR = Price per m² ÷ Cost per m² (of new builds). Higher = buying an existing home costs more than building new (land value premium); lower = building new is relatively pricier.<br />
                PCR = 每平米成交价 ÷ 每平米建造成本。数值越高，说明买现房比自建更贵（地价溢价越大）；越低则说明新建相对更贵。
            </p>
        </div>
    )
}