import type { HousingAffordability } from "../types/HousingAffordability"

interface HousingAffordabilityResponse {
  total: number
  data: HousingAffordability[]
}

export async function getHousingAffordability(): Promise<HousingAffordability[]> {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/HousingAffordability`)
    const json: HousingAffordabilityResponse = await res.json()
    return json.data
}
