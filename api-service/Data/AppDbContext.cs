// 引入命名空间 (import namespaces)
using Microsoft.EntityFrameworkCore;   // EF Core 核心类型：DbContext、DbSet、DbContextOptions
using ApiService.Models;               // 我们自己写的 Models（这里要用到 EconomicIndicator）

namespace ApiService.Data;

// 继承 (inheritance) DbContext，拿到它内置的所有数据库操作能力
// 这个类代表"整个数据库"，每个 DbSet 属性代表其中一张表
public class AppDbContext : DbContext
{
    // 构造函数 (constructor)：创建 AppDbContext 对象时自动执行
    // 接收一份"专门给 AppDbContext 用的配置" —— 泛型 (generic) <AppDbContext> 保证类型对应
    // : base(options) —— 转交给父类 DbContext 的构造函数处理，等价于 Python 的 super().__init__(options)
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
        // 空的 —— AppDbContext 自己不需要额外初始化逻辑，全部交给父类处理
    }

    // 属性 (property)：代表 economic_indicators 这张表
    // 泛型 <EconomicIndicator> 表示"每一行会被映射成一个 EconomicIndicator 对象"
    // 属性名 EconomicIndicators 就是以后查询时的入口：context.EconomicIndicators...
    public DbSet<EconomicIndicator> EconomicIndicators { get; set; }
    public DbSet<BankRate> BankRates { get; set; }
    public DbSet<FxRate> FxRates { get; set; }
    public DbSet<HousingAffordability> HousingAffordability { get; set; }
    public DbSet<HousingSalePrice> HousingSalePrice { get; set; }
}