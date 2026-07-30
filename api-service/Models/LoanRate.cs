namespace ApiService.Models;

public class LoanRate
{
    public int Id {get; set;}
    public string Bank {get; set;} = string.Empty;
    public string Product {get; set;} = string.Empty;
    public string Term {get; set;} = string.Empty;
    public decimal Rate {get; set;}
    public DateTime FetchedAt {get; set;}
}