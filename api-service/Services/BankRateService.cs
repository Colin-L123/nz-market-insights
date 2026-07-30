using ApiService.Data;
using ApiService.Models;
using Microsoft.EntityFrameworkCore;

namespace ApiService.Services;

public class BankRateService
{
    private readonly AppDbContext _context;

    public BankRateService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<BankRate>> Query(string[]? bank = null, string[]? term = null)
    {
        IQueryable<BankRate> query = _context.BankRates;
        if (bank != null)
        {
            query = query.Where(x => bank.Contains(x.Bank));
        }
        if (term != null)
        {
            query = query.Where(x => term.Contains(x.Term));
        }
        var latest = query.GroupBy(x => new { x.Bank, x.Term }).Select(g => g.OrderByDescending(x => x.FetchedAt).First());
        var bankRates = await latest.ToListAsync();

        return bankRates;
    }
}