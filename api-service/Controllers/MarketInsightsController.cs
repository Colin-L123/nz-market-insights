using ApiService.Services;
using Microsoft.AspNetCore.Mvc;

namespace ApiService.Controllers;

[ApiController]
[Route("api/[controller]")]

public class MarketInsightsController : ControllerBase
{
    private readonly MarketInsightService _marketInsightService;

    public MarketInsightsController(MarketInsightService marketInsightService)
    {
        _marketInsightService = marketInsightService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var insights = await _marketInsightService.GetAll();
        if (insights == null || insights.Count == 0)
        {
            return NotFound();
        }
        return Ok(insights);
    }
}