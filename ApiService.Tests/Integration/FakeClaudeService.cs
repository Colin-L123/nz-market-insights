using ApiService.Services;

namespace ApiService.Tests.Integration;

// IClaudeService 的假实现：只在测试里使用，立刻返回一段固定文字，
// 不发任何网络请求、不产生任何费用、结果每次都一样（确定性）。
public class FakeClaudeService : IClaudeService
{
    public Task<string> GenerateAnalysis(string prompt) =>
        Task.FromResult("This is a fake AI analysis response for testing.");
}