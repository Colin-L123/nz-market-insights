using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace ApiService.Tests.Integration;

public class AnalysisEndpointTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AnalysisEndpointTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task PostAnalysis_ReturnsOkWithFakeAiResponse()
    {
        // category 字段是多态反序列化用的判别字段（对应 DataSelection 上的 [JsonPolymorphic]），
        // 空的 Bank/Term 数组表示这个测试不筛选，BankRateService.Query() 会返回当前所有银行利率（这里是空的，正常）
        var requestBody = new
        {
            selections = new[] { new { category = "BankRates" } },
            prompt = "test question"
        };

        var response = await _client.PostAsJsonAsync("/api/Analysis", requestBody);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("fake AI analysis", content);
    }
}