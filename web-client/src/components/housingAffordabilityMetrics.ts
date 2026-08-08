import type { HousingAffordability } from "../types/HousingAffordability"

export type AffordabilityMetric = 'mortgage' | 'deposit' | 'rent'

interface AffordabilityMetricConfig {
    field: 'mortgageAffordabilityIndex' | 'depositAffordabilityIndex' | 'rentAffordabilityIndex'
    label: string
    captionEn: string
    captionCn: string
    gradientIndex: number
}

// gradientIndex 对应 chartColors.ts 里 seriesGradients 的下标 —— 三个指标挨在一起展示，
// 给每个不同的色相方便一眼区分，同时都还是同一套协调色板里的（不是随便挑颜色）。
export const affordabilityMetrics: Record<AffordabilityMetric, AffordabilityMetricConfig> = {
    mortgage: {
        field: 'mortgageAffordabilityIndex',
        label: 'Mortgage Affordability Index',
        captionEn: 'Tracks mortgage interest cost growth vs. household income growth (Q1 2012 baseline). Higher = less affordable.',
        captionCn: '房贷利息支出涨幅 vs. 家庭可支配收入涨幅（以2012年Q1为基准）。数值越高，越难负担。',
        gradientIndex: 0
    },
    deposit: {
        field: 'depositAffordabilityIndex',
        label: 'Deposit Affordability Index',
        captionEn: 'Tracks house sale price growth vs. household income growth (Q1 2012 baseline). Higher = less affordable.',
        captionCn: '房价涨幅 vs. 家庭可支配收入涨幅（以2012年Q1为基准）。数值越高，越难负担。',
        gradientIndex: 3
    },
    rent: {
        field: 'rentAffordabilityIndex',
        label: 'Rent Affordability Index',
        captionEn: 'Tracks new-tenancy rent growth vs. household income growth (Q1 2012 baseline). Higher = less affordable.',
        captionCn: '新租约租金涨幅 vs. 家庭可支配收入涨幅（以2012年Q1为基准）。数值越高，越难负担。',
        gradientIndex: 4
    }
}

export function affordabilityValue(d: HousingAffordability, metric: AffordabilityMetric): number {
    return d[affordabilityMetrics[metric].field]
}