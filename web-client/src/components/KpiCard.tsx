import '../App.css'
import './KpiCard.css'
import { formatNumber } from "../utils/format"
export default function KpiCard({ label, value, unit }: { label: string, value: number, unit?: string }) {
return (
    <div className="kpi-card glass-card">
        <p className="kpi-label">{label}</p>
        <p className="kpi-value">{formatNumber(value,2)}{unit}</p>
    </div>
)
}