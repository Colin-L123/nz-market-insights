import type { HousingSalePriceSelection } from "../types/HousingSalePriceSelection";
import type { HousingSalePrice } from "../types/HousingSalePrice";
import HousingSalePriceChart from "./HousingSalePriceChart";
import HousingSalePricePcrChart from "./HousingSalePricePcrChart";
import CategorySection from "./CategorySection";
import MultiFilterSelect from "./MultiFilterSelect";
import '../styles/formControls.css'

interface HousingSalePriceSectionProps {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    analyze: boolean
    onAnalyzeChange: (analyze: boolean) => void
    filter: Omit<HousingSalePriceSelection, 'category'>
    onFilterChange: (filter: Omit<HousingSalePriceSelection, 'category'>) => void
    data: HousingSalePrice[]
}

export default function HousingSalePriceSection({ checked, onCheckedChange, analyze, onAnalyzeChange, filter, onFilterChange, data
}: HousingSalePriceSectionProps) {
    const availableHspAreaNames = [...new Set(data.map(d => d.areaName))].sort()
    const availableHspAreaTypes = [...new Set(data.map(d => d.areaType))].sort()
    const hspYears = [...new Set(data.map(d => d.year))].sort((a, b) => a - b)
    const filteredHousingSalePrice = data.filter(d =>
        (!filter.areaName || filter.areaName.includes(d.areaName)) &&
        (!filter.areaType || filter.areaType.includes(d.areaType)) &&
        (!filter.yearFrom || d.year >= filter.yearFrom) &&
        (!filter.yearTo || d.year <= filter.yearTo)
    )

    return (
        <>
            <CategorySection label="Housing Sale Price" checked={checked} onCheckedChange={onCheckedChange}>
                <label className="form-checkbox-label">
                    <input type="checkbox" checked={analyze} onChange={(e) => onAnalyzeChange(e.target.checked)} />
                    Include in AI analysis
                </label>
                <MultiFilterSelect
                    value={filter.areaName ?? []}
                    onChange={(values) => onFilterChange({ ...filter, areaName: values.length > 0 ? values : undefined })}
                    options={availableHspAreaNames}
                    placeholder="All areas"
                />
                <MultiFilterSelect
                    value={filter.areaType ?? []}
                    onChange={(values) => onFilterChange({ ...filter, areaType: values.length > 0 ? values : undefined })}
                    options={availableHspAreaTypes}
                    placeholder="All area types"
                />
                <select className="form-select"
                    value={filter.yearFrom ?? ''}
                    onChange={(e) => onFilterChange({ ...filter, yearFrom: e.target.value ? Number(e.target.value) : undefined })}
                >
                    <option value="">Year from</option>
                    {hspYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select className="form-select"
                    value={filter.yearTo ?? ''}
                    onChange={(e) => onFilterChange({ ...filter, yearTo: e.target.value ? Number(e.target.value) : undefined })}
                >
                    <option value="">Year to</option>
                    {hspYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </CategorySection>
            {checked && (
                <div className="chart-panel">
                    <HousingSalePriceChart data={filteredHousingSalePrice} />
                    <HousingSalePricePcrChart data={filteredHousingSalePrice} />
                </div>
            )}
        </>
    )
}