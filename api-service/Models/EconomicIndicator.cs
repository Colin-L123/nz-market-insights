namespace ApiService.Models;

public class EconomicIndicator
{
    public int Id {get; set;}
    public string IndicatorName {get; set;} = string.Empty;
    public int Year {get; set;}
    public decimal Value {get; set;}
}