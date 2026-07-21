namespace ApiService.Models;

public class HousingAffordability
{
    public int Id {get; set;}
    public string AreaName {get; set;} = string.Empty;
    public string AreaType {get; set;} = string.Empty;
    public DateOnly RecordDate {get; set;}
    public decimal MortgageAffordabilityIndex {get; set;}
    public decimal DepositAffordabilityIndex {get; set;}
    public decimal RentAffordabilityIndex {get; set;}
}