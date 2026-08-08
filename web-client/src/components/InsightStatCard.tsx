import '../App.css'
import './InsightStatCard.css'

export default function InsightStatCard({ title, value, subtitle, positive }: { title: string, value: string, subtitle: string, positive?: boolean }) {
    const valueClass = positive === undefined ? '' : positive ? 'insight-stat-value-positive' : 'insight-stat-value-negative'
    return (
        <div className="insight-stat-card glass-card">
            <p className="insight-stat-title">{title}</p>
            <p className={`insight-stat-value ${valueClass}`}>{value}</p>
            <p className="insight-stat-subtitle">{subtitle}</p>
        </div>
    )
}