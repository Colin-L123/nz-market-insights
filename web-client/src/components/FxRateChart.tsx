import EChartsReact from "echarts-for-react"
import type { FxRate } from "../types/FxRate"
import { seriesColors } from "../styles/chartColors"
import { chartBase, axisLineStyle, splitLineStyle } from "../styles/chartTheme"
import { formatDate } from "../utils/format"

export default function FxRateChart({ data }: { data: FxRate[] }) {
    const currencies = data.map(d => d.targetCurrency)
    const rates = data.map(d => d.rate)
    const asOf = data[0] ? formatDate(data[0].fetchedAt) : ''

    const option = {
        ...chartBase('NZD Exchange Rates', `1 NZD in foreign currency · Source: Frankfurter API · as of ${asOf}`),
        grid: { top: 70, left: 60, right: 30, bottom: 50, containLabel: true },
        xAxis: { type: 'category', data: currencies, axisLine: axisLineStyle },
        yAxis: { type: 'value', name: 'Exchange Rate', nameLocation: 'middle', nameGap: 40, axisLine: axisLineStyle, splitLine: splitLineStyle },
        series: [{ type: 'bar', data: rates, color: seriesColors[1] }]
    }

    return <EChartsReact option={option} />
}
