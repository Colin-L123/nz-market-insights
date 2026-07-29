import type { BankRate } from "../types/BankRate";
import type { BankRateSelection } from "../types/BankRateSelection";
import BankRateChart from "./BankRateChart";
import CategorySection from "./CategorySection";
import MultiFilterSelect from "./MultiFilterSelect";

interface BankRateSectionProps {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    analyze: boolean
    onAnalyzeChange: (analyze: boolean) => void
    filter: Omit<BankRateSelection, 'category'>
    onFilterChange: (filter: Omit<BankRateSelection, 'category'>) => void
    data: BankRate[]
}

export default function BankRateSection({ checked, onCheckedChange, analyze, onAnalyzeChange, filter, onFilterChange, data
}: BankRateSectionProps) {
    const availableBanks = [...new Set(data.map(d => d.bank))]
    const availableTerms = [...new Set(data.map(d => d.term))]
    const filteredBankRate = data.filter(d =>
        (!filter.bank || filter.bank.includes(d.bank)) &&
        (!filter.term || filter.term.includes(d.term))
    )
 return(
    <>
    <CategorySection label="Bank Rate" checked={checked} onCheckedChange={onCheckedChange}>
                <label style={{ fontWeight: 'bold' }}>
                    <input type="checkbox" checked={analyze} onChange={(e) => onAnalyzeChange(e.target.checked)} />
                    Include in AI analysis
                </label>
                <MultiFilterSelect
                    value={filter.bank ?? []}
                    onChange={(values) => onFilterChange({ ...filter, bank: values.length > 0 ? values : undefined })}
                    options={availableBanks}
                    placeholder="Available Banks"
                />
                <MultiFilterSelect
                    value={filter.term ?? []}
                    onChange={(values) => onFilterChange({ ...filter, term: values.length > 0 ? values : undefined })}
                    options={availableTerms}
                    placeholder="All terms"
                />
            </CategorySection>
            {checked && (
                <div style={{ border: '1px solid #ccc', borderRadius: '6px', padding: '8px' }}>
                    <BankRateChart data={filteredBankRate} />
                </div>
            )}
    </>
 )
}
