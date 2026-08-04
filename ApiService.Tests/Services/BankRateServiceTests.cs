using System.Security.Cryptography.X509Certificates;
using ApiService.Data;
using ApiService.Models;
using ApiService.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace ApiService.Tests.Services;

public class BankRateServiceTests
{
    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task Query_RetuenOnlyLatestRatePerBankAndTerm()
    {
        //arrange
        using var context = CreateContext();
        context.BankRates.AddRange(
            new BankRate { Bank = "BNZ", Term = "7 day", Rate = 1.5m, FetchedAt = new DateTime(2026, 1, 1) },
            new BankRate { Bank = "BNZ", Term = "7 day", Rate = 1.7m, FetchedAt = new DateTime(2026, 1, 4) },
            new BankRate { Bank = "BNZ", Term = "90 day", Rate = 2.8m, FetchedAt = new DateTime(2026, 1, 1) }
        );
        await context.SaveChangesAsync();
        var service = new BankRateService(context);

        //act
        var result = await service.Query();

        //assert
        Assert.Equal(2,result.Count);
        var sevenDay = result.Single(r => r.Term == "7 day");
        Assert.Equal(1.7m,sevenDay.Rate);
    }

    [Fact]
    public async Task Query_FiltersByBank()
    {
        using var context = CreateContext();
        context.BankRates.AddRange(
            new BankRate { Bank = "BNZ", Term = "7 day", Rate = 1.7m, FetchedAt = DateTime.UtcNow },
            new BankRate { Bank = "ANZ", Term = "7 day", Rate = 1.6m, FetchedAt = DateTime.UtcNow }
        );
        await context.SaveChangesAsync();
        var service = new BankRateService(context);

        var result = await service.Query(bank: new[] { "BNZ" });

        Assert.Single(result);
        Assert.Equal("BNZ", result[0].Bank);
    }
}