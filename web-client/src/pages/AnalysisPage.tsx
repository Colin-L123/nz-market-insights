import { useState } from "react"
import type { EconomicIndicatorSelection } from "../types/EconomicIndicatorSelection"
import { getEconomicIndicator } from "../api/economicIndicators"
import type { BankRateSelection } from "../types/BankRateSelection"
import { getBankRates } from "../api/bankRates"
import type { FxRateSelection } from "../types/FxRateSelection"
import { getFxRates } from "../api/fxRates"
import type { HousingAffordabilitySelection } from "../types/HousingAffordabilitySelection"
import { getHousingAffordability } from "../api/housingAffordability"
import type { HousingSalePriceSelection } from "../types/HousingSalePriceSelection"
import { getHousingSalePrice } from "../api/housingSalePrice"
import useFetchData from "../hooks/useFetchData"
import type { DataSelection } from "../types/Analysis"
import { postAnalysis } from "../api/analysis"
import ReactMarkdown from "react-markdown"
import EconomicIndicatorSection from "../components/EconomicIndicatorSection"
import BankRateSection from "../components/BankRateSection"
import FxRateSection from "../components/FxRateSection"
import HousingAffordabilitySection from "../components/HousingAffordabilitySection"
import HousingSalePriceSection from "../components/HousingSalePriceSection"
import '../styles/formControls.css'

export default function AnalysisPage() {
    const [includeEconomicIndicators, setIncludeEconomicIndicators] = useState(true)
    const [analyzeEconomicIndicators, setAnalyzeEconomicIndicators] = useState(false)
    const [economicIndicatorFilter, setEconomicIndicatorFilter] = useState<Omit<EconomicIndicatorSelection, 'category'>>({})
    const economicIndicator = useFetchData(getEconomicIndicator)

    const [includeBankRates, setIncludeBankRates] = useState(true)
    const [analyzeBankRates, setAnalyzeBankRates] = useState(false)
    const [bankRateFilter, setBankRateFilter] = useState<Omit<BankRateSelection, 'category'>>({})
    const bankRate = useFetchData(getBankRates)

    const fxRates = useFetchData(getFxRates)
    const [includeFxRates, setIncludeFxRates] = useState(true)
    const [analyzeFxRates, setAnalyzeFxRates] = useState(false)
    const [fxRateFilter, setFxRateFilter] = useState<Omit<FxRateSelection, 'category'>>({})

    const housingAffordability = useFetchData(getHousingAffordability)
    const [includeHousingAffordability, setIncludeHousingAffordability] = useState(true)
    const [analyzeHousingAffordability, setAnalyzeHousingAffordability] = useState(false)
    const [housingAffordabilityFilter, setHousingAffordabilityFilter] = useState<Omit<HousingAffordabilitySelection, 'category'>>({})

    const housingSalePrice = useFetchData(getHousingSalePrice)
    const [includeHousingSalePrice, setIncludeHousingSalePrice] = useState(true)
    const [analyzeHousingSalePrice, setAnalyzeHousingSalePrice] = useState(false)
    const [housingSalePriceFilter, setHousingSalePriceFilter] = useState<Omit<HousingSalePriceSelection, 'category'>>({})

    const [prompt, setPrompt] = useState('')
    const [analysisResult, setAnalysisResult] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')


    function buildSelection(): DataSelection[] {
        const selections: DataSelection[] = []
        if (analyzeEconomicIndicators) {
            selections.push({ category: "EconomicIndicators", ...economicIndicatorFilter })
        }
        if (analyzeBankRates) {
            selections.push({ category: "BankRates", ...bankRateFilter })
        }
        if (analyzeFxRates) {
            selections.push({ category: "FxRates", ...fxRateFilter })
        }
        if (analyzeHousingSalePrice) {
            selections.push({ category: "HousingSalePrice", ...housingSalePriceFilter })
        }
        if (analyzeHousingAffordability) {
            selections.push({ category: "HousingAffordability", ...housingAffordabilityFilter })
        }
        return selections
    }

    async function handleSubmit() {
        setIsLoading(true)
        setError('')
        try {
            const result = await postAnalysis({ selections: buildSelection(), prompt })
            setAnalysisResult(result)
        } catch (err) {
            console.error(err)
            setError(err instanceof Error ? err.message : 'Failed, please retry later'
            )
        } finally {
            setIsLoading(false)
        }
    }

    return <div className="placeholder-page max-w-6xl mx-auto flex flex-col gap-4">
        <EconomicIndicatorSection
            checked={includeEconomicIndicators}
            onCheckedChange={setIncludeEconomicIndicators}
            analyze={analyzeEconomicIndicators}
            onAnalyzeChange={setAnalyzeEconomicIndicators}
            filter={economicIndicatorFilter}
            onFilterChange={setEconomicIndicatorFilter}
            data={economicIndicator}
        />
        <BankRateSection
            checked={includeBankRates}
            onCheckedChange={setIncludeBankRates}
            analyze={analyzeBankRates}
            onAnalyzeChange={setAnalyzeBankRates}
            filter={bankRateFilter}
            onFilterChange={setBankRateFilter}
            data={bankRate}
        />

        <FxRateSection
            checked={includeFxRates}
            onCheckedChange={setIncludeFxRates}
            analyze={analyzeFxRates}
            onAnalyzeChange={setAnalyzeFxRates}
            filter={fxRateFilter}
            onFilterChange={setFxRateFilter}
            data={fxRates}
        />

        <HousingAffordabilitySection
            checked={includeHousingAffordability}
            onCheckedChange={setIncludeHousingAffordability}
            analyze={analyzeHousingAffordability}
            onAnalyzeChange={setAnalyzeHousingAffordability}
            filter={housingAffordabilityFilter}
            onFilterChange={setHousingAffordabilityFilter}
            data={housingAffordability}
        />

        <HousingSalePriceSection
            checked={includeHousingSalePrice}
            onCheckedChange={setIncludeHousingSalePrice}
            analyze={analyzeHousingSalePrice}
            onAnalyzeChange={setAnalyzeHousingSalePrice}
            filter={housingSalePriceFilter}
            onFilterChange={setHousingSalePriceFilter}
            data={housingSalePrice}
        />

        <textarea value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask questions to AI, please type here"
            className="form-textarea"
        />
        <button onClick={handleSubmit} disabled={isLoading} className="btn-primary">
            {isLoading ? 'Analyzing…' : 'Start AI Analysis'}
        </button>
        <p style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>Runs a metered AI API call — please use thoughtfully.</p>
        {analysisResult && <div className="chart-panel"><ReactMarkdown>{analysisResult}</ReactMarkdown></div>}
        {error && <div className="form-error-text">{error}</div>}

    </div>
}