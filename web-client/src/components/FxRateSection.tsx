import type { FxRate } from "../types/FxRate";
import type { FxRateSelection } from "../types/FxRateSelection";
import FxRateChart from "./FxRateChart";
import CategorySection from "./CategorySection";
import MultiFilterSelect from "./MultiFilterSelect";

interface FxRateSectionProps {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    analyze: boolean
    onAnalyzeChange: (analyze: boolean) => void
    filter: Omit<FxRateSelection, 'category'>
    onFilterChange: (filter: Omit<FxRateSelection, 'category'>) => void
    data: FxRate[]
}

export default function FxRateSection({ checked, onCheckedChange, analyze, onAnalyzeChange, filter, onFilterChange, data
}: FxRateSectionProps) {
    const availableTarget = [...new Set(data.map(t => t.targetCurrency))]
    const filteredFxRates = data.filter(d =>
        !filter.target || filter.target.includes(d.targetCurrency)
    )
return(
    <>
    <CategorySection label="Currency exchange rate" checked={checked} onCheckedChange={onCheckedChange}>
                <label style={{ fontWeight: 'bold' }}>
                    <input type="checkbox" checked={analyze} onChange={(e) => onAnalyzeChange(e.target.checked)} />
                    Include in AI analysis
                </label>
                <MultiFilterSelect
                    value={filter.target ?? []}
                    onChange={(values) => onFilterChange({ ...filter, target: values.length > 0 ? values : undefined })}
                    options={availableTarget}
                    placeholder="Available Currencies"
                />
            </CategorySection>
            {checked && (
                <div style={{ border: '1px solid #ccc', borderRadius: '6px', padding: '8px' }}>
                    <FxRateChart data={filteredFxRates} />
                </div>
            )}
    </>
)
}