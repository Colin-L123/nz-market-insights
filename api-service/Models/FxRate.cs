namespace ApiService.Models;

public class FxRate
{
    public int Id {get; set;}
    public string BaseCurrency {get; set;} = string.Empty;
    public string TargetCurrency {get; set;} = string.Empty;
    public decimal Rate {get; set;}
    public DateOnly RateDate {get; set;}
    public DateTime FetchedAt {get; set;}
}