export default function CategorySection({ label, checked, onCheckedChange, children }: { label: string, checked: boolean, onCheckedChange: (checked: boolean) => void, children: React.ReactNode }) {
    return (
        <div style={{ border: '1px solid #ccc', borderRadius: '6px', padding: '8px' }}>
            <label>
                <input type="checkbox"
                    checked={checked}
                    onChange={(e) => onCheckedChange(e.target.checked)}
                />
                {label}
            </label>
            {checked && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {children}
                </div>
            )}
        </div>
    )
}