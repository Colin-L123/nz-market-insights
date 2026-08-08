import type { EconomicIndicator } from "../types/EconomicIndicator"
import type { EconomicIndicatorSelection } from "../types/EconomicIndicatorSelection"
import { indicatorLabels } from "../types/EconomicIndicator"
import CategorySection from "./CategorySection"
import MultiFilterSelect from "./MultiFilterSelect"
import EconomicIndicatorChart from "./EconomicIndicatorChart"
import '../styles/formControls.css'

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
        .sort((a, b) => (indicatorLabels[a] ?? a).localeCompare(indicatorLabels[b] ?? b))
    const years = [...new Set(data.map(d => d.year))].sort((a, b) => a - b)
    const filteredData = data.filter(d =>
        (!filter.indicatorName || filter.indicatorName.includes(d.indicatorName)) &&
        (!filter.yearFrom || d.year >= filter.yearFrom) &&
        (!filter.yearTo || d.year <= filter.yearTo)
    )

    return (
        <>
            <CategorySection label="Economic Indicators" checked={checked} onCheckedChange={onCheckedChange}>
                <label className="form-checkbox-label">
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
                <select className="form-select"
                    value={filter.yearFrom ?? ''}
                    onChange={(e) => onFilterChange({ ...filter, yearFrom: e.target.value ? Number(e.target.value) : undefined })}
                >
                    <option value="">Year from</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select className="form-select"
                    value={filter.yearTo ?? ''}
                    onChange={(e) => onFilterChange({ ...filter, yearTo: e.target.value ? Number(e.target.value) : undefined })}
                >
                    <option value="">Year to</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </CategorySection>
            {checked && (
                <div className="chart-panel">
                    <EconomicIndicatorChart data={filteredData} />
                </div>
            )}
        </>
    )
}