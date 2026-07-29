import type { EconomicIndicator } from "../types/EconomicIndicator"
import type { EconomicIndicatorSelection } from "../types/EconomicIndicatorSelection"
import { indicatorLabels } from "../types/EconomicIndicator"
import CategorySection from "./CategorySection"
import MultiFilterSelect from "./MultiFilterSelect"
import EconomicIndicatorChart from "./EconomicIndicatorChart"

interface EconomicIndicatorSectionProps {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    analyze: boolean
    onAnalyzeChange: (analyze: boolean) => void
    filter: Omit<EconomicIndicatorSelection, 'category'>
    onFilterChange: (filter: Omit<EconomicIndicatorSelection, 'category'>) => void
    data: EconomicIndicator[]
}

export default function EconomicIndicatorSection({
    checked, onCheckedChange, analyze, onAnalyzeChange, filter, onFilterChange, data
}: EconomicIndicatorSectionProps) {
    const availbaleIndicators = [...new Set(data.map(d => d.indicatorName))]
    const years = [...new Set(data.map(d => d.year))].sort((a, b) => a - b)
    const yearMin = years.length ? Math.min(...years) : undefined
    const yearMax = years.length ? Math.max(...years) : undefined
    const filteredData = data.filter(d =>
        (!filter.indicatorName || filter.indicatorName.includes(d.indicatorName)) &&
        (!filter.yearFrom || d.year >= filter.yearFrom) &&
        (!filter.yearTo || d.year <= filter.yearTo)
    )

    return (
        <>
            <CategorySection label="Economic Indicetors" checked={checked} onCheckedChange={onCheckedChange}>
                <label style={{ fontWeight: 'bold' }}>
                    <input type="checkbox" checked={analyze} onChange={(e) => onAnalyzeChange(e.target.checked)} />
                    Include in AI analysis
                </label>
                <MultiFilterSelect
                    value={filter.indicatorName ?? []}
                    onChange={(values) => onFilterChange({ ...filter, indicatorName: values.length > 0 ? values : undefined })}
                    options={availbaleIndicators}
                    placeholder="All indicators"
                    labelFor={(name) => indicatorLabels[name] ?? name}
                />
                <input type="number" list="year-options" style={{ width: '160px' }}
                    placeholder="Year from"
                    min={yearMin}
                    max={yearMax}
                    value={filter.yearFrom ?? ''}
                    onChange={(e) => onFilterChange({ ...filter, yearFrom: e.target.value ? Number(e.target.value) : undefined })}
                />
                <datalist id="year-options">
                    {years.map(y => <option key={y} value={y} />)}
                </datalist>
                <input type="number" list="year-options" style={{ width: '160px' }}
                    placeholder="Year to"
                    min={yearMin}
                    max={yearMax}
                    value={filter.yearTo ?? ''}
                    onChange={(e) => onFilterChange({ ...filter, yearTo: e.target.value ? Number(e.target.value) : undefined })}
                />
            </CategorySection>
            {checked && (
                <div style={{ border: '1px solid #ccc', borderRadius: '6px', padding: '8px' }}>
                    <EconomicIndicatorChart data={filteredData} />
                </div>
            )}
        </>
    )
}