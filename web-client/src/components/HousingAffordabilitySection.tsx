import type { HousingAffordability } from "../types/HousingAffordability";
import type { HousingAffordabilitySelection } from "../types/HousingAffordabilitySelection";
import HousingAffordabilityChart from "./HousingAffordabilityChart";
import CategorySection from "./CategorySection";
import MultiFilterSelect from "./MultiFilterSelect";

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
    const availableAffAreaNames = [...new Set(data.map(d => d.areaName))]
        const availableAffAreaTypes = [...new Set(data.map(d => d.areaType))]
        const availableDates = [...new Set(data.map(d => d.recordDate))].sort()
        const dateMin = availableDates[0]
        const dateMax = availableDates[availableDates.length - 1]
        const filteredHousingAffordability = data.filter(d =>
            (!filter.areaName || filter.areaName.includes(d.areaName)) &&
            (!filter.areaType || filter.areaType.includes(d.areaType)) &&
            (!filter.dateFrom || d.recordDate >= filter.dateFrom) &&
            (!filter.dateTo || d.recordDate <= filter.dateTo)
        )
 return(
    <>
    <CategorySection label="Housing Affordability" checked={checked} onCheckedChange={onCheckedChange}>
                <label style={{ fontWeight: 'bold' }}>
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
                <input type="date" list="haff-date-options" style={{ width: '160px' }}
                    min={dateMin}
                    max={dateMax}
                    value={filter.dateFrom ?? ''}
                    onChange={(e) => onFilterChange({ ...filter, dateFrom: e.target.value || undefined })}
                />
                <datalist id="haff-date-options">
                    {availableDates.map(d => <option key={d} value={d} />)}
                </datalist>
                <input type="date" list="haff-date-options" style={{ width: '160px' }}
                    min={dateMin}
                    max={dateMax}
                    value={filter.dateTo ?? ''}
                    onChange={(e) => onFilterChange({ ...filter, dateTo: e.target.value || undefined })}
                />
            </CategorySection>
            {checked && (
                <div style={{ border: '1px solid #ccc', borderRadius: '6px', padding: '8px' }}>
                    <HousingAffordabilityChart data={filteredHousingAffordability} metric="mortgage" />
                    <HousingAffordabilityChart data={filteredHousingAffordability} metric="deposit" />
                    <HousingAffordabilityChart data={filteredHousingAffordability} metric="rent" />
                </div>
            )}
    </>
 )
}