using Anthropic;
using Anthropic.Models.Messages;

namespace ApiService.Services;

public class ClaudeService
{
    private readonly AnthropicClient _client;

    public ClaudeService(IConfiguration configuration)
    {
        var apiKey = configuration["Anthropic: ApiKey"];
        _client = new AnthropicClient {ApiKey = apiKey};
    }

    public async Task<string> GenerateAnalysis(string prompt)
    {
        var response = await _client.Messages.Create(new MessageCreateParams
        {
            Model = "claude-haiku-4-5", MaxTokens = 1024, Messages = [new() {Role = Role.User, Content = prompt}]
        });

        var textBlock = response.Content.Select(b => b.Value).OfType<TextBlock>().FirstOrDefault();
        return textBlock?.Text ?? string.Empty;
    }
}