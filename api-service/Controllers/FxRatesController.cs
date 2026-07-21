using Microsoft.AspNetCore.Mvc;
using ApiService.Services;

namespace ApiService.Controllers;

[ApiController]
[Route("api/[controller]")]

public class FxRatesController : ControllerBase
{
    private readonly FxRatesService _fxRateService;
    public FxRatesController(FxRatesService fxRateService){
        _fxRateService = fxRateService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? target = null)
    {
        var fxRates = await _fxRateService.Query(target);
        if (fxRates == null || fxRates.Count == 0)
        {
            return NotFound();
        }
        return Ok(fxRates);
    }
}