import type { BankRate } from "../types/BankRate";

export async function getBankRates(): Promise<BankRate[]> {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/BankRates`)
    return res.json();
}