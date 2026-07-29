import type { EconomicIndicatorSelection } from "./EconomicIndicatorSelection";
import type { BankRateSelection } from "./BankRateSelection";
import type { FxRateSelection } from "./FxRateSelection";
import type { HousingAffordabilitySelection } from "./HousingAffordabilitySelection";
import type { HousingSalePriceSelection } from "./HousingSalePriceSelection";

export type DataSelection = EconomicIndicatorSelection | BankRateSelection | FxRateSelection | HousingAffordabilitySelection | HousingSalePriceSelection

export interface AnalysisRequest{
    selections: DataSelection[]
    prompt: string
}