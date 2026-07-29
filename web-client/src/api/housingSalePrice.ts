import type { HousingSalePrice } from "../types/HousingSalePrice"

interface HousingSalePriceResponse {
  count: number
  data: HousingSalePrice[]
}

export async function getHousingSalePrice(): Promise<HousingSalePrice[]> {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/HousingSalePrice`)
    const json: HousingSalePriceResponse = await res.json()
    return json.data
}
