import type { HousingAffordability } from "../types/HousingAffordability";
import type { HousingAffordabilitySelection } from "../types/HousingAffordabilitySelection";
import HousingAffordabilityChart from "./HousingAffordabilityChart";
import CategorySection from "./CategorySection";
import MultiFilterSelect from "./MultiFilterSelect";
import { formatDate } from "../utils/format";
import '../styles/formControls.css'

interface HousingAffordabilitySectionProps {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    analyze: boolean
    onAnalyzeChange: (analyze: boolean) => void
    filter: Omit<HousingAffordabilitySelection, 'category'>
    onFilterChange: (filter: Omit<HousingAffordabilitySelection, 'category'>) => void
    data: HousingAffordability[]
}

export default function HousingAffordabilitySection({ checked, onCheckedChange, analyze, onAnalyzeChange, filter, onFilterChange, data
}: HousingAffordabilitySectionProps) {
    const availableAffAreaNames = [...new Set(data.map(d => d.areaName))].sort()
        const availableAffAreaTypes = [...new Set(data.map(d => d.areaType))].sort()
        const availableDates = [...new Set(data.map(d => d.recordDate))].sort()
        const filteredHousingAffordability = data.filter(d =>
            (!filter.areaName || filter.areaName.includes(d.areaName)) &&
            (!filter.areaType || filter.areaType.includes(d.areaType)) &&
            (!filter.dateFrom || d.recordDate >= filter.dateFrom) &&
            (!filter.dateTo || d.recordDate <= filter.dateTo)
        )
 return(
    <>
    <CategorySection label="Housing Affordability" checked={checked} onCheckedChange={onCheckedChange}>
                <label className="form-checkbox-label">
                    <input type="checkbox" checked={analyze} onChange={(e) => onAnalyzeChange(e.target.checked)} />
                    Include in AI analysis
                </label>
                <MultiFilterSelect
                    value={filter.areaName ?? []}
                    onChange={(values) => onFilterChange({ ...filter, areaName: values.length > 0 ? values : undefined })}
                    options={availableAffAreaNames}
                    placeholder="All areas"
                />
                <MultiFilterSelect
                    value={filter.areaType ?? []}
                    onChange={(values) => onFilterChange({ ...filter, areaType: values.length > 0 ? values : undefined })}
                    options={availableAffAreaTypes}
                    placeholder="All area types"
                />
                <select className="form-select"
                    value={filter.dateFrom ?? ''}
                    onChange={(e) => onFilterChange({ ...filter, dateFrom: e.target.value || undefined })}
                >
                    <option value="">Date from</option>
                    {availableDates.map(d => <option key={d} value={d}>{formatDate(d)}</option>)}
                </select>
                <select className="form-select"
                    value={filter.dateTo ?? ''}
                    onChange={(e) => onFilterChange({ ...filter, dateTo: e.target.value || undefined })}
                >
                    <option value="">Date to</option>
                    {availableDates.map(d => <option key={d} value={d}>{formatDate(d)}</option>)}
                </select>
            </CategorySection>
            {checked && (
                <div className="chart-panel">
                    <HousingAffordabilityChart data={filteredHousingAffordability} metric="mortgage" />
                    <HousingAffordabilityChart data={filteredHousingAffordability} metric="deposit" />
                    <HousingAffordabilityChart data={filteredHousingAffordability} metric="rent" />
                </div>
            )}
    </>
 )
}