import { getEconomicIndicator } from "../api/economicIndicators"
import { getBankRates } from "../api/bankRates"
import { getHousingAffordability } from "../api/housingAffordability"
import { getFxRates } from "../api/fxRates"
import { getHousingSalePrice } from "../api/housingSalePrice"
import useFetchData from "../hooks/useFetchData"

import EconomicIndicatorChart from "../components/EconomicIndicatorChart"
import EconomicIndicatorKpis from "../components/EconomicIndicatorKpis"
import Section from "../components/Section"
import './HomePage.css'
import BankRateChart from "../components/BankRateChart"
import FxRateChart from "../components/FxRateChart"
import HousingAffordabilityChart from "../components/HousingAffordabilityChart"
import HousingSalePriceChart from "../components/HousingSalePriceChart"
import HousingAffordabilityTrendChart from "../components/HousingAffordabilityTrendChart"
import HousingSalePriceTrendChart from "../components/HousingSalePriceTrendChart"
import HousingSalePriceVolumeChart from "../components/HousingSalePriceVolumeChart"
import HousingSalePricePcrChart from "../components/HousingSalePricePcrChart"
import HousingSalePricePcrTrendChart from "../components/HousingSalePricePcrTrendChart"


export default function HomePage() {
    const ecoIndi = useFetchData(getEconomicIndicator)
    const bankRate = useFetchData(getBankRates)
    const fxRate = useFetchData(getFxRates)
    const haff = useFetchData(getHousingAffordability)
    const hsp = useFetchData(getHousingSalePrice)

    return <div className="home-page">
        <h1 className="home-page-title">Default Display (Chart + AI Summary) — In Progress</h1>
        <Section title="Key Indicator">
            <EconomicIndicatorKpis data={ecoIndi} />
        </Section>
        <Section title="Yearly Trend">
            <EconomicIndicatorChart data={ecoIndi} />
        </Section>
        <Section title="BNZ Term Deposit Rates">
            <BankRateChart data={bankRate} />
        </Section>
        <Section title="Exchange Rates">
            <FxRateChart data={fxRate} />
        </Section>
        <Section title="Housing Affordbility">
            <HousingAffordabilityChart data={haff} metric="mortgage" />
            <HousingAffordabilityChart data={haff} metric="deposit" />
            <HousingAffordabilityChart data={haff} metric="rent" />
        </Section>
        <Section title="Housing Affordbility Trend Til 2025">
            <HousingAffordabilityTrendChart data={haff} metric="mortgage" />
            <HousingAffordabilityTrendChart data={haff} metric="deposit" />
            <HousingAffordabilityTrendChart data={haff} metric="rent" />
        </Section>
        <Section title="Housing Sale Price">
            <HousingSalePriceChart data={hsp} />
            <HousingSalePricePcrChart data={hsp} />
        </Section>
        <Section title="Housing Sale Price Trend Til 2025">
            <HousingSalePriceTrendChart data={hsp} />
            <HousingSalePricePcrTrendChart data={hsp} />
        </Section>
        <Section title="Housing Sale Volume">
            <HousingSalePriceVolumeChart data={hsp} />
        </Section>
    </div>
}