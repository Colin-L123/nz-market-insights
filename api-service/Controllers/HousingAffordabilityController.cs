using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiService.Data;
using ApiService.Models;
using ApiService.Dtos;
using ApiService.Services;

namespace ApiService.Controllers;

[ApiController]
[Route("api/[controller]")]

public class HousingAffordabilityController : ControllerBase
{
    private readonly HousingAffordabilityService _haffs;

    public HousingAffordabilityController(HousingAffordabilityService haffs)
    {
        _haffs = haffs;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? areaName = null, [FromQuery] string? areaType = null, [FromQuery] DateOnly? dateFrom = null, [FromQuery] DateOnly? dateTo = null)
    {
        var h_aff = await _haffs.Query(areaName, areaType, dateFrom, dateTo);
        var totalCount = h_aff.Count;
        if (h_aff == null || totalCount == 0)
        {
            return NotFound();
        }
        return Ok(new 
        {
            Total = totalCount,  // 总条数
            Data = h_aff         // 真实的数据列表
        });
    }
}
