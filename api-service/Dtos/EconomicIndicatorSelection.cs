namespace ApiService.Dtos;
public class EconomicIndicatorSelection : DataSelection
{
    public string? IndicatorName{get; set;}
    public int? YearFrom{get; set;}
    public int? YearTo{get; set;}
}