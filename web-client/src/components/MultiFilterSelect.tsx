import { useState } from "react"

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
        <details style={{ position: 'relative', width: '160px' }}>
            <summary style={{ border: '1px solid gray', padding: '2px 4px', cursor: 'pointer' }}>{summary}</summary>
            <div style={{
                position: 'absolute', top: '100%', left: 0, width: '200px', marginTop: '2px',
                background: 'white', border: '1px solid gray', borderRadius: '4px',
                maxHeight: '220px', overflowY: 'auto', zIndex: 10, padding: '4px'
            }}>
                <input type="text" placeholder="Search..." value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: '100%', marginBottom: '4px', boxSizing: 'border-box' }} />
                {filteredOptions.map(opt => (
                    <label key={opt} style={{ display: 'block' }}>
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