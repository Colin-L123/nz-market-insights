using ApiService.Dtos;
using ApiService.Services;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]

public class AnalysisController : ControllerBase
{
    private readonly EconomicIndicatorService _economicIndicatorService;
    private readonly BankRateService _bankRateService;
    private readonly FxRatesService _fxRatesService;
    private readonly HousingAffordabilityService _housingAffordabilityService;
    private readonly HousingSalePriceService _housingSalePriceService;
    private readonly ClaudeService _claudeService;

    public AnalysisController(EconomicIndicatorService economicIndicatorService, BankRateService bankRateService, FxRatesService fxRatesService, HousingAffordabilityService housingAffordabilityService, HousingSalePriceService housingSalePriceService, ClaudeService claudeService)
    {
        _economicIndicatorService = economicIndicatorService;
        _fxRatesService = fxRatesService;
        _bankRateService = bankRateService;
        _housingAffordabilityService = housingAffordabilityService;
        _housingSalePriceService = housingSalePriceService;
        _claudeService = claudeService;
    }

    private async Task<string> SummarizeEconomicIndicators(EconomicIndicatorSelection s)
    {
        var data = await _economicIndicatorService.Query(s.IndicatorName, s.YearFrom, s.YearTo);
        var lines = data.Select(x => $"{x.IndicatorName} {x.Year}: {x.Value}");
        return string.Join("\n", lines);
    }
    private async Task<string> SummarizeBankRates(BankRateSelection s)
    {
        var data = await _bankRateService.Query(s.Bank, s.Term);
        var lines = data.Select(x => $"{x.Bank} {x.Term}: {x.Rate}");
        return string.Join("\n", lines);
    }
    private async Task<string> SummarizeFxRates(FxRateSelection s)
    {
        var data = await _fxRatesService.Query(s.Target);
        var lines = data.Select(x => $"{x.BaseCurrency} to {x.TargetCurrency}: {x.Rate}");
        return string.Join("\n", lines);
    }
    private async Task<string> SummarizeHousingAffordability(HousingAffordabilitySelection s)
    {
        var data = await _housingAffordabilityService.Query(s.AreaName, s.AreaType, s.DateFrom, s.DateTo);
        var lines = data.Select(x => $"area: {x.AreaName}, type: {x.AreaType}, Mortgage Affordability Index: {x.MortgageAffordabilityIndex}, Deposit Affordability Index: {x.DepositAffordabilityIndex}, Rent Affordability Index: {x.RentAffordabilityIndex}");
        return string.Join("\n", lines);
    }
    private async Task<string> SummarizeHousingSalePrice(HousingSalePriceSelection s)
    {
        var data = await _housingSalePriceService.Query(s.AreaName, s.AreaType, s.YearFrom, s.YearTo);
        var lines = data.Select(x => $"area: {x.AreaName}, type: {x.AreaType}, cost_per_m2: {x.CostPerM2}, average price per house: {(x.NumberSales > 0 ? (x.SumSalePrice / x.NumberSales).ToString() : "N/A")}");
        return string.Join("\n", lines);
    }




    [HttpPost]
    public async Task<IActionResult> Analyze([FromBody] AnalysisRequest request)
    {
        var summaries = new List<string>();
        foreach (var selection in request.Selections)
        {
            string summary = selection switch
            {
                EconomicIndicatorSelection s => await SummarizeEconomicIndicators(s),
                BankRateSelection s => await SummarizeBankRates(s),
                FxRateSelection s => await SummarizeFxRates(s),
                HousingAffordabilitySelection s => await SummarizeHousingAffordability(s),
                HousingSalePriceSelection s => await SummarizeHousingSalePrice(s),
                _ => throw new ArgumentException("unknown type of selection")
            };
            summaries.Add(summary);
        }
        string combinedData = string.Join("\n\n", summaries);
        string fullPrompt = $"user's data: \n{combinedData}\n\n user's question: {request.Prompt}";
        var result = await _claudeService.GenerateAnalysis(fullPrompt);
        return Ok(result);
    }
}