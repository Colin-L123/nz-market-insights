export function formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString('en-NZ', { year: 'numeric', month: 'short', day: 'numeric' })
}
export function formatNumber(value: number, maxDecimals = 2): string {
    return new Intl.NumberFormat('en-NZ', { maximumFractionDigits: maxDecimals }).format(value)
}
