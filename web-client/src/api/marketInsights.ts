import type { MarketInsight } from "../types/MarketInsight"

export async function getMarketInsights(): Promise<MarketInsight[]> {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/MarketInsights`)
    return res.json()
}