namespace ApiService.Dtos;

public class AnalysisRequest
{
    public List<DataSelection> Selections{get; set;} = [];

    public string Prompt {get; set;} = string.Empty;
}