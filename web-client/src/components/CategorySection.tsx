import '../styles/formControls.css'

export default function CategorySection({ label, checked, onCheckedChange, children }: { label: string, checked: boolean, onCheckedChange: (checked: boolean) => void, children: React.ReactNode }) {
    return (
        <div className="category-section">
            <label className="form-checkbox-label">
                <input type="checkbox"
                    checked={checked}
                    onChange={(e) => onCheckedChange(e.target.checked)}
                />
                {label}
            </label>
            {checked && (
                <div className="category-section-body">
                    {children}
                </div>
            )}
        </div>
    )
}