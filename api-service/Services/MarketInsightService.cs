using ApiService.Data;
using ApiService.Models;
using Microsoft.EntityFrameworkCore;

namespace ApiService.Services;

public class MarketInsightService
{
    private readonly AppDbContext _context;

    public MarketInsightService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<MarketInsight>> GetAll()
    {
        return await _context.MarketInsights.ToListAsync();
    }
}