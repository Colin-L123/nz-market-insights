using ApiService.Data;
using ApiService.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace ApiService.Tests.Integration;

// 定制版 WebApplicationFactory：起一个跟真实 API 一样的内存测试服务器，
// 但把 Program.cs 里注册的真实 Postgres 连接、真实付费 AI 服务，都换成测试专用的假实现。
public class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    // 每个 factory 实例对应一份独立的内存数据库，同一个测试类里的多个测试共用这一份
    private readonly string _dbName = Guid.NewGuid().ToString();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // RemoveAll 把 Program.cs 里 AddDbContext(...UseNpgsql...) 注册的东西整个拔掉，
            // 换成指向内存数据库的版本。AddDbContext 除了注册 DbContextOptions 本身，还会
            // 额外注册一份"配置动作列表"(IDbContextOptionsConfiguration)，只删前者的话，
            // Program.cs 里 UseNpgsql(...) 那条配置动作还残留着，会跟这里新加的 UseInMemoryDatabase(...)
            // 同时生效，触发"注册了两个数据库驱动"的报错，所以两个都要删。
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.RemoveAll<IDbContextOptionsConfiguration<AppDbContext>>();
            services.AddDbContext<AppDbContext>(options => options.UseInMemoryDatabase(_dbName));

            // 同样把真实的 ClaudeService 换成假实现，测试不会真的调用付费 API
            services.RemoveAll<IClaudeService>();
            services.AddScoped<IClaudeService, FakeClaudeService>();
        });
    }
}