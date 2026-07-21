using ApiService.Data;
using ApiService.Models;
using Microsoft.EntityFrameworkCore;

namespace ApiService.Services;

public class BankRateService
{
    private readonly AppDbContext _context;

    public BankRateService(AppDbContext context){
        _context = context;
    }

    public async Task<List<BankRate>> Query(string? bank = null, string? term = null)
    {
        IQueryable<BankRate> query = _context.BankRates;
        if(bank != null)
        {
            query = query.Where(x => x.Bank == bank);
        }
        if(term != null)
        {
            query = query.Where(x => x.Term == term);
        }
        var bankRates = await query.ToListAsync();
        
        return bankRates;
    }
}