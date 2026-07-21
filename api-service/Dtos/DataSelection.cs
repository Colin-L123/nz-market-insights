using System.Text.Json.Serialization;

namespace ApiService.Dtos;
[JsonPolymorphic(TypeDiscriminatorPropertyName ="category")]
[JsonDerivedType(typeof(EconomicIndicatorSelection), "EconomicIndicators")]
[JsonDerivedType(typeof(BankRateSelection),"BankRates")]
[JsonDerivedType(typeof(FxRateSelection), "FxRates")]
[JsonDerivedType(typeof(HousingAffordabilitySelection), "HousingAffordability")]
[JsonDerivedType(typeof(HousingSalePriceSelection), "HousingSalePrice")]


public abstract class DataSelection
{
    
}
