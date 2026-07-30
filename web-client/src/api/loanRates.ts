import type { LoanRate } from "../types/LoanRate"

export async function getLoanRates(): Promise<LoanRate[]> {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/LoanRates`)
    return res.json()
}