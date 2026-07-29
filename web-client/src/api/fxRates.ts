import type { FxRate } from "../types/FxRate";

export async function getFxRates(): Promise<FxRate[]> {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/FxRates`)
    return res.json()
}