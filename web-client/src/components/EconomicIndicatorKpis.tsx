import KpiCard from "./KpiCard";    
import { indicatorLabels, type EconomicIndicator } from "../types/EconomicIndicator";

export default function EconomicIndicatorKpis({data}: {data: EconomicIndicator[]}){
    const indicatorNames = [...new Set(data.map(d => d.indicatorName))]
    const latestValues = indicatorNames.map(name => {
        const entriesForeName = data.filter(d => d.indicatorName === name)
        const latestYear = Math.max(...entriesForeName.map(d => d.year))
        return entriesForeName.find(d => d.year === latestYear)
    })
    return(
        <div className="kpi-grid">
            {latestValues.map(item => item && (
                <KpiCard key = {item.indicatorName} label = {`${indicatorLabels[item.indicatorName] ?? item.indicatorName} (${item.year})`} value={item.value}/>
            ))}
        </div>
    )
}