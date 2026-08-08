import EChartsReact from "echarts-for-react";
import type { BankRate } from "../types/BankRate";
import { seriesGradients } from "../styles/chartColors";
import { chartBase, axisLineStyle, splitLineStyle } from "../styles/chartTheme";
import { formatDate } from "../utils/format";

function termToDays(term: string): number {
    const [numStr, unit] = term.split(' ')
    const num = Number(numStr)
    if (unit.startsWith('day')) return num
    if (unit.startsWith('month')) return num * 30
    if (unit.startsWith('year')) return num * 365
    return 0
}

export default function BankRateChart({data}: {data: BankRate[]}){
    const sorted = [...data].sort((a,b) => termToDays(a.term) - termToDays(b.term))
    const terms = sorted.map(d => d.term)
    const rates = sorted.map(d => d.rate)
    const asOf = data[0] ? formatDate(data[0].fetchedAt) : ''
    const option = {
    ...chartBase('BNZ Term Deposit Rates', `Interest rate by deposit term length · as of ${asOf}`),
    grid: { top: 70, left: 60, right: 30, bottom: 50, containLabel: true },
    xAxis: { type: 'category', data: terms, axisLine: axisLineStyle },
    yAxis: { type: 'value', name: 'Interest Rate (%)', nameLocation: 'middle', nameGap: 40, axisLine: axisLineStyle, splitLine: splitLineStyle },
    series: [{ type: 'bar', data: rates, color: seriesGradients[2] }] // amber — savings/term-deposit theme
}

    return <EChartsReact option={option}/>

}