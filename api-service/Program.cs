// 引入命名空间 (import namespaces) —— 类似 Python 的 import
using Microsoft.EntityFrameworkCore;  // EF Core 核心功能：DbContext、AddDbContext 等
using ApiService.Data;// 我们自己写的 AppDbContext
using ApiService.Models;
using ApiService.Services;                 

// 创建构建器 (builder)：应用启动前的"配置阶段"从这里开始
// var 是编译期类型推断，不是动态类型 —— builder 的类型在编译时就已确定为 WebApplicationBuilder，调用一个"静态工厂方法"CreateBuilder，造出一个构建器（builder）对象，专门用来在应用真正启动之前做各种配置。args 是命令行参数。
var builder = WebApplication.CreateBuilder(args);//args基本默认不变

// 注册服务 (register services) 到依赖注入容器 (DI container)
builder.Services.AddOpenApi();   // 注册"自动生成API文档"服务 (Swagger/OpenAPI)，builder.Services 是"服务容器"（所有要注册进依赖注入系统的东西都放这里）。

// 从配置系统读取连接字符串 (connection string)
// builder.Configuration 会自动去 User Secrets / 环境变量 / appsettings.json 里找这个 key。key、value形式，value是str，后被拆解。
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var anthropciApiKey = builder.Configuration["Anthropic: ApiKey"];

// 注册 AppDbContext 到 DI 容器，<AppDbContext> 是泛型 (generic) 写法
// options => ... 是 lambda，链式调用 (method chaining)：UseNpgsql 指定驱动，UseSnakeCaseNamingConvention 处理命名转换
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString).UseSnakeCaseNamingConvention());

builder.Services.AddScoped<EconomicIndicatorService>();
builder.Services.AddScoped<FxRatesService>();
builder.Services.AddScoped<BankRateService>();
builder.Services.AddScoped<HousingAffordabilityService>();
builder.Services.AddScoped<HousingSalePriceService>();
builder.Services.AddScoped<ClaudeService>();

// 注册 Controller 相关基础设施 —— 少了这行，Controller 上的路由不会被框架识别
builder.Services.AddControllers();

// 真正"组装"出可运行的应用对象 —— 之前是配置阶段，这行之后拿到真正的 app
var app = builder.Build();

// 配置 HTTP 请求管道 (request pipeline) —— 以下每一行都是在往"管道"里加东西
// 只在开发环境 (Development) 暴露 API 文档地址
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// 中间件 (middleware)：每个请求经过时都会执行，这个负责把 HTTP 重定向到 HTTPS，自己写的中间件也要放在这里，顺序重要
app.UseHttpsRedirection();

// 把 Controller 里用特性 (attribute) 定义的路由，真正接入请求处理流程
app.MapControllers();

// 启动服务器，开始监听请求 —— 这行之后程序会一直运行 (阻塞)，直到手动停止
app.Run();

