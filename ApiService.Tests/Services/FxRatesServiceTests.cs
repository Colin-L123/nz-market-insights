using ApiService.Data;
using ApiService.Models;
using ApiService.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace ApiService.Tests.Services;

public class FxRatesServiceTests
{
    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task Query_ReturnsOnlyLatestRatePerCurrencyPair()
    {
        using var context = CreateContext();
        context.FxRates.AddRange(
            new FxRate { BaseCurrency = "NZD", TargetCurrency = "USD", Rate = 0.60m, RateDate = new DateOnly(2026, 1, 1), FetchedAt = new DateTime(2026, 1, 1) },
            new FxRate { BaseCurrency = "NZD", TargetCurrency = "USD", Rate = 0.62m, RateDate = new DateOnly(2026, 1, 4), FetchedAt = new DateTime(2026, 1, 4) },
            new FxRate { BaseCurrency = "NZD", TargetCurrency = "EUR", Rate = 0.55m, RateDate = new DateOnly(2026, 1, 1), FetchedAt = new DateTime(2026, 1, 1) }
        );
        await context.SaveChangesAsync();
        var service = new FxRatesService(context);

        var result = await service.Query();

        Assert.Equal(2, result.Count);
        var usd = result.Single(r => r.TargetCurrency == "USD");
        Assert.Equal(0.62m, usd.Rate);
    }

    [Fact]
    public async Task Query_FiltersByTargetCurrency()
    {
        using var context = CreateContext();
        context.FxRates.AddRange(
            new FxRate { BaseCurrency = "NZD", TargetCurrency = "USD", Rate = 0.62m, FetchedAt = DateTime.UtcNow },
            new FxRate { BaseCurrency = "NZD", TargetCurrency = "EUR", Rate = 0.55m, FetchedAt = DateTime.UtcNow }
        );
        await context.SaveChangesAsync();
        var service = new FxRatesService(context);

        var result = await service.Query(target: new[] { "USD" });

        Assert.Single(result);
        Assert.Equal("USD", result[0].TargetCurrency);
    }
}