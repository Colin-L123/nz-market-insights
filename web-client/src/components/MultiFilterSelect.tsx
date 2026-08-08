import { useState } from "react"
import '../styles/formControls.css'

export interface MultiFilterSelectProps {
    value: string[]
    onChange: (values: string[]) => void
    options: string[]
    placeholder: string
    labelFor?: (option: string) => string
}

export default function MultiFilterSelect({ value, onChange, options, placeholder, labelFor }: MultiFilterSelectProps) {
    const [search, setSearch] = useState('')

    function toggle(option: string) {
        if (value.includes(option)) {
            onChange(value.filter(v => v !== option))
        } else {
            onChange([...value, option])
        }
    }

    const summary = value.length > 0
        ? value.map(v => labelFor ? labelFor(v) : v).join(', ')
        : placeholder

    const filteredOptions = options.filter(opt => {
        const label = labelFor ? labelFor(opt) : opt
        return label.toLowerCase().includes(search.toLowerCase())
    })

    return (
        <details className="multi-select">
            <summary className="multi-select-trigger">{summary}</summary>
            <div className="multi-select-panel">
                <input type="text" placeholder="Search..." value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="multi-select-search" />
                {filteredOptions.map(opt => (
                    <label key={opt} className="multi-select-option">
                        <input type="checkbox"
                            checked={value.includes(opt)}
                            onChange={() => toggle(opt)} />
                        {labelFor ? labelFor(opt) : opt}
                    </label>
                ))}
            </div>
        </details>
    )
}