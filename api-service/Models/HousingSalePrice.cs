namespace ApiService.Models;

public class HousingSalePrice
{
    public int Id { get; set; }
    public int Year { get; set; }
    public string AreaName { get; set; } = string.Empty;
    public string AreaCode { get; set; } = string.Empty;
    public string AreaType { get; set; } = string.Empty;
    public decimal SumFloorAreaSold { get; set; }
    public decimal SumSalePrice { get; set; }
    public int NumberSales { get; set; }
    public decimal PricePerM2 { get; set; }
    public decimal? NumberBc { get; set; }
    public decimal? CostPerM2 { get; set; }
    public decimal? SumValueNew { get; set; }
    public decimal? Pcr { get; set; }
}