export const axisLineStyle = { lineStyle: { color: '#383835' } }
export const splitLineStyle = { lineStyle: { color: '#2c2c2a' } }

export function chartBase(title: string, subtext: string) {
    return {
        backgroundColor: 'transparent',
        textStyle: { color: '#c3c2b7' },
        title: {
            text: title,
            subtext: subtext,
            left: 'center',
            top: 10,
            textStyle: { color: '#ffffff' },
            subtextStyle: { color: '#898781' }
        },
        tooltip: { trigger: 'axis' },
    }
}
