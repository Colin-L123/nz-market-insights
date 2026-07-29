import './KpiCard.css'
export default function KpiCard({ label, value, unit }: { label: string, value: number, unit?: string }) {
return (
    <div className="kpi-card">
        <p className="kpi-label">{label}</p>
        <p className="kpi-value">{value}{unit}</p>
    </div>
)
}