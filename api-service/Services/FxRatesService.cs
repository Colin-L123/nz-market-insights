using ApiService.Data;
using ApiService.Models;
using Microsoft.EntityFrameworkCore;

namespace ApiService.Services;

public class FxRatesService
{
    private readonly AppDbContext _context;

    public FxRatesService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<FxRate>> Query(string[]? target = null)
    {
        IQueryable<FxRate> query = _context.FxRates;
        if(target != null)
        {
            query = query.Where(x => target.Contains(x.TargetCurrency));
        }
        var latest = query.GroupBy(x=>new {x.BaseCurrency, x.TargetCurrency}).Select(g=>g.OrderByDescending(x=>x.FetchedAt).First());
        var fxRates = await latest.ToListAsync();
        return fxRates;
    }
}