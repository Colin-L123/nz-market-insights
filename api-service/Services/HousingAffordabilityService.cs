using ApiService.Data;
using ApiService.Models;
using Microsoft.EntityFrameworkCore;

namespace ApiService.Services;

public class HousingAffordabilityService
{
    private readonly AppDbContext _context;

    public HousingAffordabilityService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<HousingAffordability>> Query(string? areaName = null, string? areaType = null, DateOnly? dateFrom = null, DateOnly? dateTo = null)
    {
        IQueryable<HousingAffordability> query = _context.HousingAffordability;
        if(areaName != null)
        {
            query = query.Where(x => x.AreaName == areaName);
        }
         if(areaType != null)
        {
            query = query.Where(x => x.AreaType == areaType);
        } 
        if(dateFrom != null)
        {
            query = query.Where(x => x.RecordDate >= dateFrom);
        } 
        if(dateTo != null)
        {
            query = query.Where(x => x.RecordDate <= dateTo);
        }
        var h_aff = await query.ToListAsync();
        return h_aff; 
    }
}