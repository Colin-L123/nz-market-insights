import { formatNumber } from "../utils/format"
export const axisLineStyle = { lineStyle: { color: '#cfcfc8' } }
export const splitLineStyle = { lineStyle: { color: '#e6e6e1' } }

export function chartBase(title: string, subtext: string) {
    return {
        backgroundColor: 'transparent',
        textStyle: { color: '#53565c' },
        title: {
            text: title,
            subtext: subtext,
            left: 'center',
            top: 10,
            textStyle: { color: '#16191c' },
            subtextStyle: { color: '#83868c' }
        },
        tooltip: { trigger: 'axis', valueFormatter: (value: number) => formatNumber(value) },
    }
}