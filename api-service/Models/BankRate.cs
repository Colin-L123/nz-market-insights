namespace ApiService.Models;

public class BankRate
{
    public int Id {get; set;}
    public string Bank {get; set;} = string.Empty;
    public string Term {get; set;} = string.Empty;
    public decimal Rate {get; set;}
    public DateTime FetchedAt {get; set;}
}