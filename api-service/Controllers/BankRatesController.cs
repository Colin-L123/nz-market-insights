using Microsoft.AspNetCore.Mvc;
using ApiService.Services;

namespace ApiService.Controllers;

[ApiController]
[Route("api/[controller]")]

public class BankRatesController : ControllerBase
{
    private readonly BankRateService _bankRateService;

    public BankRatesController(BankRateService bankRateService)
    {
        _bankRateService = bankRateService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? bank = null, [FromQuery] string? term = null)
    {
        var bankRates = await _bankRateService.Query(bank, term);
        if (bankRates == null || bankRates.Count == 0)
        {
            return NotFound();
        }
        return Ok(bankRates);
    }
}