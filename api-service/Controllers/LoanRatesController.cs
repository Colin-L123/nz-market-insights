using Microsoft.AspNetCore.Mvc;
using ApiService.Services;

namespace ApiService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LoanRatesController : ControllerBase
{
    private readonly LoanRateService _loanRateService;

    public LoanRatesController(LoanRateService loanRateService)
    {
        _loanRateService = loanRateService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string[]? bank = null, [FromQuery] string[]? product = null, [FromQuery] string[]? term = null)
    {
        var loanRates = await _loanRateService.Query(bank, product, term);
        if (loanRates == null || loanRates.Count == 0)
        {
            return NotFound();
        }
        return Ok(loanRates);
    }
}