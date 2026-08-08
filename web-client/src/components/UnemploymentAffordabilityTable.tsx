import '../App.css'
import './UnemploymentAffordabilityTable.css'
import type { UnemploymentAffordabilityPayload } from "../types/MarketInsight"

export default function UnemploymentAffordabilityTable({ data }: { data: UnemploymentAffordabilityPayload }) {
    const rows = [
        { label: 'Deposit (saving for a down payment)', ...data.deposit },
        { label: 'Mortgage (loan repayments)', ...data.mortgage },
        { label: 'Rent', ...data.rent },
    ]
    return (
        <div className="affordability-impact-card glass-card">
            <p className="affordability-impact-title">Who Does Unemployment Hit Hardest?</p>
            <p className="affordability-impact-subtitle">How much of the year-to-year change in each affordability dimension is explained by the unemployment rate (2006-2025)</p>
            <table className="affordability-impact-table">
                <thead>
                    <tr><th>Dimension</th><th>R²</th><th>Significant?</th></tr>
                </thead>
                <tbody>
                    {rows.map(r => (
                        <tr key={r.label}>
                            <td>{r.label}</td>
                            <td>{r.r_squared.toFixed(2)}</td>
                            <td>{r.p_value < 0.05 ? 'Yes' : 'No'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}