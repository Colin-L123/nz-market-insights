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

    public async Task<List<FxRate>> Query(string? target = null)
    {
        IQueryable<FxRate> query = _context.FxRates;
        if(target != null)
        {
            query = query.Where(x => x.TargetCurrency == target);
        }
        var fxRates = await query.ToListAsync();
        return fxRates;
    }
}