import EChartsReact from "echarts-for-react"
import type { CapitalAllocationPayload } from "../types/MarketInsight"
import { chartBase, axisLineStyle, splitLineStyle } from "../styles/chartTheme"

// 跟 styles/tokens.css 里的 --status-good / --status-critical 保持一致
const POSITIVE_COLOR = '#059669'
const NEGATIVE_COLOR = '#dc2626'

export default function CapitalAllocationChart({ data }: { data: CapitalAllocationPayload }) {
    const categories = [`Property (${data.years_span}-yr real CAGR)`, 'Term Deposit (real)', 'Cash (idle, real)']
    const values = [data.property_real_cagr_pct, data.term_deposit_real_return_pct, data.cash_real_return_pct]

    const option = {
        ...chartBase('Where Should Capital Go?', 'Real (inflation-adjusted) annual return by option'),
        grid: { top: 70, left: 60, right: 30, bottom: 80, containLabel: true },
        xAxis: { type: 'category', data: categories, axisLine: axisLineStyle, axisLabel: { rotate: 15 } },
        yAxis: { type: 'value', name: 'Real Annual Return (%)', nameLocation: 'middle', nameGap: 40, axisLine: axisLineStyle, splitLine: splitLineStyle },
        series: [{
            type: 'bar',
            data: values.map(v => ({ value: v, itemStyle: { color: v >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR } }))
        }]
    }
    return <EChartsReact option={option} />
}