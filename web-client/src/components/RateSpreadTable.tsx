import '../App.css'
import './RateSpreadTable.css'
import type { RateSpreadPayload } from "../types/MarketInsight"

export default function RateSpreadTable({ data }: { data: RateSpreadPayload }) {
    return (
        <div className="rate-spread-card glass-card">
            <p className="rate-spread-title">Term Deposit vs Home Loan Rate</p>
            <p className="rate-spread-subtitle">Is it better to save, or pay down debt? (BNZ Standard home loan)</p>
            <table className="rate-spread-table">
                <thead>
                    <tr>
                        <th>Term</th>
                        <th>Deposit Rate</th>
                        <th>Loan Rate</th>
                        <th>Spread</th>
                    </tr>
                </thead>
                <tbody>
                    {data.terms.map(t => (
                        <tr key={t.deposit_term}>
                            <td>{t.deposit_term}</td>
                            <td>{t.deposit_rate}%</td>
                            <td>{t.loan_rate}%</td>
                            <td>{t.spread}pp</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}