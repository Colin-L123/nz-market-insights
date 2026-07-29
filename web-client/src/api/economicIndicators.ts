import type { EconomicIndicator } from "../types/EconomicIndicator"

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export async function getEconomicIndicator(): Promise<EconomicIndicator[]> {
    const res = await fetch(`${baseUrl}/api/EconomicIndicators`)
    return res.json()
}