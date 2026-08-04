using System.Net;
using ApiService.Data;
using ApiService.Models;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace ApiService.Tests.Integration;

public class BankRatesEndpointTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public BankRatesEndpointTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetBankRates_ReturnsNotFound_WhenNoMatchingDataExists()
    {
        // 用一个不会被别的测试用到的筛选值，避免因为测试执行顺序不确定而互相影响
        var response = await _client.GetAsync("/api/BankRates?bank=NonExistentBank12345");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetBankRates_ReturnsOkWithData_WhenDataExists()
    {
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            context.BankRates.Add(new BankRate { Bank = "IntegrationTestBank", Term = "1 year", Rate = 4.5m, FetchedAt = DateTime.UtcNow });
            await context.SaveChangesAsync();
        }

        var response = await _client.GetAsync("/api/BankRates?bank=IntegrationTestBank");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("IntegrationTestBank", content);
    }
}