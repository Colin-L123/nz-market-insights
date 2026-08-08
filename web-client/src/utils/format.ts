export function formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString('en-NZ', { year: 'numeric', month: 'short', day: 'numeric' })
}
export function formatNumber(value: number, maxDecimals = 2): string {
    return new Intl.NumberFormat('en-NZ', { maximumFractionDigits: maxDecimals }).format(value)
}
export function formatCompact(value: number): string {
    return new Intl.NumberFormat('en-NZ', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}
// Shared by BankRateChart/LoanRateChart (sorting bars short-term to long-term) and
// BankRateSection (sorting the term filter dropdown the same way, instead of leaving
// it in whatever order the API happened to return rows in).
export function termToDays(term: string): number {
    if (term === 'Variable') return 0
    const [numStr, unit] = term.split(' ')
    const num = Number(numStr)
    if (unit.startsWith('day')) return num
    if (unit.startsWith('month')) return num * 30
    if (unit.startsWith('year')) return num * 365
    return 0
}
