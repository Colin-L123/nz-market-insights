import type { HousingSalePriceSelection } from "../types/HousingSalePriceSelection";
import type { HousingSalePrice } from "../types/HousingSalePrice";
import HousingSalePriceChart from "./HousingSalePriceChart";
import HousingSalePricePcrChart from "./HousingSalePricePcrChart";
import CategorySection from "./CategorySection";
import MultiFilterSelect from "./MultiFilterSelect";

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
    const availableHspAreaNames = [...new Set(data.map(d => d.areaName))]
    const availableHspAreaTypes = [...new Set(data.map(d => d.areaType))]
    const hspYears = [...new Set(data.map(d => d.year))].sort((a, b) => a - b)
    const hspYearMin = hspYears.length ? Math.min(...hspYears) : undefined
    const hspYearMax = hspYears.length ? Math.max(...hspYears) : undefined
    const filteredHousingSalePrice = data.filter(d =>
        (!filter.areaName || filter.areaName.includes(d.areaName)) &&
        (!filter.areaType || filter.areaType.includes(d.areaType)) &&
        (!filter.yearFrom || d.year >= filter.yearFrom) &&
        (!filter.yearTo || d.year <= filter.yearTo)
    )

    return (
        <>
            <CategorySection label="Housing Sale Price" checked={checked} onCheckedChange={onCheckedChange}>
                <label style={{ fontWeight: 'bold' }}>
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
                <input type="number" list="hsp-year-options" style={{ width: '160px' }}
                    placeholder="Year from"
                    min={hspYearMin}
                    max={hspYearMax}
                    value={filter.yearFrom ?? ''}
                    onChange={(e) => onFilterChange({ ...filter, yearFrom: e.target.value ? Number(e.target.value) : undefined })}
                />
                <datalist id="hsp-year-options">
                    {hspYears.map(y => <option key={y} value={y} />)}
                </datalist>
                <input type="number" list="hsp-year-options" style={{ width: '160px' }}
                    placeholder="Year to"
                    min={hspYearMin}
                    max={hspYearMax}
                    value={filter.yearTo ?? ''}
                    onChange={(e) => onFilterChange({ ...filter, yearTo: e.target.value ? Number(e.target.value) : undefined })}
                />
            </CategorySection>
            {checked && (
                <div style={{ border: '1px solid #ccc', borderRadius: '6px', padding: '8px' }}>
                    <HousingSalePriceChart data={filteredHousingSalePrice} />
                    <HousingSalePricePcrChart data={filteredHousingSalePrice} />
                </div>
            )}
        </>
    )
}