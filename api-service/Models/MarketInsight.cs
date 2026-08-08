using System.Text.Json;

namespace ApiService.Models;

public class MarketInsight
{
    public int Id { get; set; }
    public string InsightKey { get; set; } = string.Empty;
    public DateTime ComputedAt { get; set; }
    public JsonDocument Payload { get; set; } = null!;
}