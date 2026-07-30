using ApiService.Data;
using ApiService.Models;
using Microsoft.EntityFrameworkCore;

namespace ApiService.Services;

public class LoanRateService
{
    private readonly AppDbContext _context;

    public LoanRateService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<LoanRate>> Query(string[]? bank = null, string[]? product = null, string[]? term = null)
    {
        IQueryable<LoanRate> query = _context.LoanRates;
        if(bank != null)
        {
            query = query.Where(x => bank.Contains(x.Bank));
        }
        if(product != null)
        {
            query = query.Where(x => product.Contains(x.Product));
        }
        if(term != null)
        {
            query = query.Where(x => term.Contains(x.Term));
        }

        var latest = query
            .GroupBy(x => new { x.Bank, x.Product, x.Term })
            .Select(g => g.OrderByDescending(x => x.FetchedAt).First());

        var loanRates = await latest.ToListAsync();
        return loanRates;
    }
}