using ApiService.Data;
using ApiService.Models;
using Microsoft.EntityFrameworkCore;

namespace ApiService.Services;

public class EconomicIndicatorService
{
    private readonly AppDbContext _context;

    public EconomicIndicatorService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<EconomicIndicator>> Query(string? indicatorName = null, int? yearFrom = null, int? yearTo = null)
    {
        IQueryable<EconomicIndicator> query= _context.EconomicIndicators;
        if(indicatorName != null)
        {
            query = query.Where(x => x.IndicatorName == indicatorName);
        }
        if(yearFrom != null)
        {
            query = query.Where(x => x.Year >= yearFrom);
        } 
        if(yearTo != null)
        {
            query = query.Where(x => x.Year <= yearTo);
        }
        var result = await query.ToListAsync();
        return result;
    }
}