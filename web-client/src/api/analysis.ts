import type { AnalysisRequest } from "../types/Analysis";

export async function postAnalysis(request: AnalysisRequest): Promise<string> {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/Analysis`, {method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request)})
    if(!res.ok){
        throw new Error(await res.text())
    }
    return res.text()
}