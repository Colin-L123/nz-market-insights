import EChartsReact from "echarts-for-react"
import type { LoanRate } from "../types/LoanRate"
import { seriesGradients } from "../styles/chartColors"
import { chartBase, axisLineStyle, splitLineStyle } from "../styles/chartTheme"
import { formatDate } from "../utils/format"

function termToDays(term: string): number {
    if (term === 'Variable') return 0
    const [numStr, unit] = term.split(' ')
    const num = Number(numStr)
    if (unit.startsWith('day')) return num
    if (unit.startsWith('month')) return num * 30
    if (unit.startsWith('year')) return num * 365
    return 0
}

export default function LoanRateChart({ data }: { data: LoanRate[] }) {
    const sorted = [...data].sort((a, b) => termToDays(a.term) - termToDays(b.term))
    const labels = sorted.map(d => `${d.product} (${d.term})`)
    const rates = sorted.map(d => d.rate)
    const asOf = data[0] ? formatDate(data[0].fetchedAt) : ''

    const option = {
        ...chartBase('BNZ Home Loan Rates', `Interest rate by product and term · as of ${asOf}`),
        grid: { top: 70, left: 60, right: 30, bottom: 130, containLabel: true },
        xAxis: {
            type: 'category', data: labels, axisLine: axisLineStyle,
            axisLabel: { rotate: 45, fontSize: 11 }
        },
        yAxis: { type: 'value', name: 'Interest Rate (%)', nameLocation: 'middle', nameGap: 40, axisLine: axisLineStyle, splitLine: splitLineStyle },
        series: [{ type: 'bar', data: rates, color: seriesGradients[3] }] // violet — borrowing theme, distinct from term-deposit's amber
    }
    return <EChartsReact option={option} style={{ height: '480px' }} />
}