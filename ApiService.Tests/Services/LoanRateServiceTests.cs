using ApiService.Data;
using ApiService.Models;
using ApiService.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace ApiService.Tests.Services;

public class LoanRateServiceTests
{
    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task Query_ReturnsOnlyLatestRatePerBankProductAndTerm()
    {
        using var context = CreateContext();
        context.LoanRates.AddRange(
            new LoanRate { Bank = "BNZ", Product = "Standard", Term = "1 year", Rate = 5.5m, FetchedAt = new DateTime(2026, 1, 1) },
            new LoanRate { Bank = "BNZ", Product = "Standard", Term = "1 year", Rate = 5.3m, FetchedAt = new DateTime(2026, 1, 4) },
            new LoanRate { Bank = "BNZ", Product = "Standard", Term = "2 year", Rate = 5.6m, FetchedAt = new DateTime(2026, 1, 1) }
        );
        await context.SaveChangesAsync();
        var service = new LoanRateService(context);

        var result = await service.Query();

        Assert.Equal(2, result.Count);
        var oneYear = result.Single(r => r.Term == "1 year");
        Assert.Equal(5.3m, oneYear.Rate);
    }

    [Fact]
    public async Task Query_FiltersByProduct()
    {
        using var context = CreateContext();
        context.LoanRates.AddRange(
            new LoanRate { Bank = "BNZ", Product = "Standard", Term = "1 year", Rate = 5.3m, FetchedAt = DateTime.UtcNow },
            new LoanRate { Bank = "BNZ", Product = "Premier", Term = "1 year", Rate = 5.1m, FetchedAt = DateTime.UtcNow }
        );
        await context.SaveChangesAsync();
        var service = new LoanRateService(context);

        var result = await service.Query(product: new[] { "Premier" });

        Assert.Single(result);
        Assert.Equal("Premier", result[0].Product);
    }
}