namespace ApiService.Services;

public interface IClaudeService{
    Task<string> GenerateAnalysis(string prompt);
}