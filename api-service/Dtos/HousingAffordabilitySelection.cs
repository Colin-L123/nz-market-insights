namespace ApiService.Dtos;

public class HousingAffordabilitySelection : DataSelection
{
    public string? AreaName{get; set;}
    public string? AreaType{get; set;}
    public DateOnly? DateFrom{get; set;}
    public DateOnly? DateTo{get; set;}
}