import EChartsReact from "echarts-for-react"
import type { LoanRate } from "../types/LoanRate"
import { seriesColors } from "../styles/chartColors"
import { chartBase, axisLineStyle, splitLineStyle } from "../styles/chartTheme"

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

    const option = {
        ...chartBase('BNZ Home Loan Rates', 'Interest rate by product and term'),
        grid: { top: 70, left: 60, right: 30, bottom: 90, containLabel: true },
        xAxis: { type: 'category', data: labels, axisLine: axisLineStyle, axisLabel: { rotate: 30 } },
        yAxis: { type: 'value', name: 'Interest Rate (%)', nameLocation: 'middle', nameGap: 40, axisLine: axisLineStyle, splitLine: splitLineStyle },
        series: [{ type: 'bar', data: rates, color: seriesColors[5] }]
    }
    return <EChartsReact option={option} />
}