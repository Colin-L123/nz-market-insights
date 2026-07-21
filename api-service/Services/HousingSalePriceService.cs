using ApiService.Data;
using ApiService.Models;
namespace ApiService.Services;
using Microsoft.EntityFrameworkCore;

public class HousingSalePriceService
{
    private readonly AppDbContext _context;
    public HousingSalePriceService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<HousingSalePrice>> Query(string? areaName = null, string? areaType = null, int? yearFrom = null, int? yearTo = null)
    {
        IQueryable<HousingSalePrice> query = _context.HousingSalePrice;
        if(areaName != null)
        {
            query = query.Where(x => x.AreaName == areaName);
        }
         if(areaType != null)
        {
            query = query.Where(x => x.AreaType == areaType);
        } 
        if(yearFrom != null)
        {
            query = query.Where(x => x.Year >= yearFrom);
        } 
        if(yearTo != null)
        {
            query = query.Where(x => x.Year <= yearTo);
        }
        var hsp = await query.ToListAsync();
        return hsp;
    }
}