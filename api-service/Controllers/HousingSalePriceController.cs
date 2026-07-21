using Microsoft.AspNetCore.Mvc;
using ApiService.Services;
using ApiService.Models;

namespace ApiService.Controllers;

[ApiController]
[Route("api/[controller]")]

public class HousingSalePriceController : ControllerBase
{
    private readonly HousingSalePriceService _housingSalePriceService;
    public HousingSalePriceController(HousingSalePriceService housingSalePriceService)
    {
        _housingSalePriceService = housingSalePriceService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? areaName = null, [FromQuery] string? areaType = null, [FromQuery] int? yearFrom = null, [FromQuery] int? yearTo = null)
    {
        
        var hsp = await _housingSalePriceService.Query(areaName, areaType, yearFrom, yearTo);
        var c = hsp.Count;
        if(hsp == null || c == 0)
        {
            return NotFound();
        }
        return Ok(new {Count = c, Data = hsp});

    }
}