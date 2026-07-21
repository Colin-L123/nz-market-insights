namespace ApiService.Dtos;

public class HousingSalePriceSelection : DataSelection
{
    public string? AreaName{get; set;}
    public string? AreaType{get; set;}
    public int? YearFrom{get; set;}
    public int? YearTo{get; set;}
}