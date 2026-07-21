// 引入命名空间 (import namespaces)
// using Microsoft.EntityFrameworkCore;   // ToListAsync() 等异步查询方法
using Microsoft.AspNetCore.Mvc;        // Controller 相关：ApiController、Route、HttpGet 特性都来自这里  
using ApiService.Services;              

namespace ApiService.Controllers;

// 特性 (attribute)：给这个类"贴标签"
[ApiController]                          // 告诉框架"这是一个API控制器"，自动处理请求校验等
[Route("api/[controller]")]              // 定义响应路径；[controller] 会被替换成类名去掉"Controller"后缀 → api/EconomicIndicators
// 继承 (inheritance) ControllerBase：拿到 Ok()、NotFound() 等生成HTTP响应的方法
// (纯API用 ControllerBase 就够；Controller 不带Base多了渲染HTML视图的能力，网页应用才需要)
public class EconomicIndicatorsController : ControllerBase
{
    // 私有字段 (private field)，readonly 表示只能在构造函数里赋值一次，之后不能再改
    private readonly EconomicIndicatorService _economicIndicatorService;

    // 构造函数 (constructor) —— 依赖注入 (Dependency Injection) 真正发生的地方
    // 框架看到这里需要一个 EconomicIndicatorService，自动用 Program.cs 里注册配置好的那份传进来
    // 查询逻辑本身搬到了 EconomicIndicatorService 里，这里只负责调用，不再直接碰 AppDbContext
    public EconomicIndicatorsController(EconomicIndicatorService economicIndicatorService)
    {
        _economicIndicatorService = economicIndicatorService;
    }

    [HttpGet]  // 贴在方法上：这个方法响应 GET 请求 (跟贴在类上的 [Route] 不同，这个更具体到某个方法)
    // async 标记这个方法内部会用 await；返回类型必须包一层 Task<>（语法规定）
    // IActionResult：泛指"某种HTTP响应"（可能是 Ok / NotFound / BadRequest 等）
    public async Task<IActionResult> GetAll([FromQuery] string? indicatorName = null, [FromQuery] int? yearFrom = null, [FromQuery] int? yearTo = null)
    {
        // 筛选+查询的逻辑都在 EconomicIndicatorService.Query() 里，这里只传参数、拿结果
        var indicator = await _economicIndicatorService.Query(indicatorName, yearFrom, yearTo);
        // Ok(...) 是 ControllerBase 自带的辅助方法：生成 HTTP 200 响应，数据自动序列化成 JSON
        if (indicator == null ||  indicator.Count== 0)
        {
            return NotFound();
        }
        return Ok(indicator);
    }

}