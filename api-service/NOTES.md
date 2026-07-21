# C# / ASP.NET Core 学习笔记（api-service）

给自己复习用，记录这个项目里 C# 部分涉及到的核心概念。

## 项目整体结构

```
api-service/
  Models/          数据结构定义，跟数据库表一一对应（database-first：先有表，再照着写类）
  Data/            AppDbContext，负责"怎么连接、访问数据库"，是 Models 和真实数据库之间的桥梁
  Controllers/     对外暴露的接口，接住 HTTP 请求，通过 Data 查数据，决定返回什么
  Program.cs       应用入口，配置整体服务（数据库连接、中间件等），启动服务器
  ApiService.csproj  项目配置文件（目标.NET版本、依赖的NuGet包），大致相当于 requirements.txt，但内嵌在项目里
  appsettings.json  非敏感配置（部署到生产环境后，敏感配置会从这里/环境变量读取，本地开发用 User Secrets 代替）
  launchSettings.json  本地开发启动配置（端口、环境变量），不会被部署，纯本地用
```

## 命名约定（C# vs Python 对比）

| 场景 | C# | Python |
|---|---|---|
| 类名/公开成员 | PascalCase | Python 类名也用 PascalCase，但函数/变量用 snake_case |
| 局部变量/私有字段 | camelCase（私有字段常加下划线前缀 `_name`） | snake_case |
| 文件名 | 必须跟类名完全一致（强约定，Java 是强制的，C#是约定） | snake_case，无此约定 |
| 数据库（Postgres） | 用 `EFCore.NamingConventions` 包自动把 PascalCase 转成 snake_case 对应 | N/A |
| 接口（interface） | 习惯以大写 `I` 开头，比如 `IActionResult` | N/A（Python没有强制接口语法，靠"鸭子类型"） |

## 核心概念速查

- **`var`**：不是"创建变量"的缩写，是"类型"的缩写——编译器在编译期就自动推断、锁定具体类型，不是动态类型（跟 Python 完全不同，Python变量本身没有固定类型，C#的`var`只是省略手写类型，类型依然是静态、编译期确定的）。
- **字段（field）**：类里的一个变量，直接内存访问，没有额外逻辑。惯例上私有字段常用，公开字段不推荐。
- **属性（property）**：`{ get; set; }`——外部用起来跟字段一样（`obj.Name`），但背后是两个方法（getter/setter）。C# 公开成员一律用属性，不用字段，原因：① 以后能加逻辑不破坏外部调用方式 ② JSON 序列化默认只认属性，不认字段。
- **命名空间（namespace）**：逻辑分组，跟文件夹是"强约定"但非强制对应，编译器不检查。根命名空间默认等于 `.csproj` 文件名（除非 `.csproj` 里显式写了 `<RootNamespace>`）。
- **构造函数（constructor）**：名字跟类名完全一致、不声明任何返回类型（连void都没有）的特殊方法，创建对象时自动执行。不是所有类都需要自己写——不写的话编译器会给一个空的默认构造函数（前提是没写别的构造函数）。判断是不是构造函数，最可靠的标志是"完全没有返回类型"，不是"名字像不像类名"。
- **继承 `:`（inheritance）**：`class A : B` 表示 A 继承 B，拿到 B 的所有能力。
- **构造函数初始化器 `: base(...)`**：跟继承的冒号长得一样但含义不同（同一个符号，两种语法位置，两种含义）——表示"先调用父类的构造函数，把这些参数传过去"，等价于 Python 的 `super().__init__(...)`。
- **泛型（generics）`<T>`**：让一个类/方法能用于任意类型，不用为每种类型重复写代码，同时保留编译期类型检查。`T` 是类型占位符，使用时换成具体类型。`DbSet<EconomicIndicator>`（这张表装EconomicIndicator类型的行）、`DbContextOptions<AppDbContext>`（专给AppDbContext用的配置）、`AddDbContext<AppDbContext>(...)`（注册的是AppDbContext类型）都是泛型的具体应用。Python没有直接对应概念（动态类型天然不需要），类型标注`list[dict]`只是提示不强制。
- **LINQ**：C# 内置的查询语法（`.Where()`、`.Select()`），能作用于任何数据源（内存列表、数据库等）。只有配合 EF Core 用在 `DbSet` 上时才会被翻译成 SQL；用在普通 `List` 上就是纯内存操作，没有翻译。
- **延迟执行（deferred execution）**：`_context.BankRates`（以及叠加的`.Where()`/`.OrderBy()`）本身不会立刻查数据库，只是"查询描述"（`IQueryable`），像Python的生成器/`range()`一样惰性。只有调用`.ToListAsync()`/`.FirstOrDefaultAsync()`/`.CountAsync()`这类"终结方法"，才会真正触发一次SQL查询、把结果拿回内存变成真实的`List`。好处：多个`.Where()`叠加时，最终只生成一句高效SQL在数据库端筛选，不用先搬全表数据再在C#里筛。
- **async/await**：处理"很多用户同时发请求"场景的机制，等待数据库/网络这类耗时操作时不阻塞线程。批处理脚本（比如 Python 那边的 fetch 脚本）不需要，Web API 天然需要。`async`方法只能返回`void`/`Task`/`Task<T>`三选一，语法硬性规定，不能返回别的（比如Controller方法固定用`Task<IActionResult>`）。
- **依赖注入（DI, Dependency Injection）**：见下方单独一节，展开写。
- **特性（attribute）**：`[ApiController]`、`[HttpGet]` 这种方括号写法，给类/方法"贴标签"，提供额外的元信息给框架读取。

## OOP：父类/子类/抽象类/接口 的关系（有Java基础，用对照表最快）

**"父类/子类"是关系，不是类型**——普通类和抽象类都可以当"父类"被继承，父类/子类描述的是"谁继承了谁"这个相对关系。**真正不同的"类型"，是按"完成度"排列的一个光谱**：

```
普通类（100%实现，能直接new）→ 抽象类（部分实现，不能直接new）→ 接口（0%实现，不能直接new）
```

**Java vs C# 对照表**：

| 概念 | Java | C# |
|---|---|---|
| 继承 | `class Child extends Parent` | `class Child : Parent` |
| 实现接口 | `class Circle implements IShape` | `class Circle : IShape`（**跟继承用同一个冒号！**光看语法分不出是继承还是实现接口，要看右边具体是类还是接口，接口习惯以`I`开头） |
| 同时继承+实现接口 | `extends Parent implements IShape` | `: Parent, IShape`（父类写第一个，逗号分隔） |
| 访问父类成员 | `super.method()` / `super(args)` | `base.Method()` / `base(args)` |
| 方法能不能被子类重写 | 默认可以，除非`final` | 默认不行，父类必须显式标`virtual`/`abstract`才能被重写 |
| 子类提供自己的实现 | `@Override`（注解，非强制） | `override`（关键字，**强制**） |
| 禁止继续继承/重写 | `final` | `sealed`（类）；方法不标`virtual`本身就等于禁止 |
| 单继承限制 | 一个类只能继承一个父类 | 一样 |
| 多接口 | 可以`implements`多个 | 可以实现多个，逗号分隔 |

**接口 vs 继承，本质区别是"IS-A" vs "CAN-DO"**：继承表达"是什么"（`Circle`是`Shape`的一种，天然共享实现）；接口表达"能做什么"（不要求共同祖先，只要求都能完成同一件事）。举例：`Eagle`、`Penguin` 都继承`Bird`（是鸟），但只有`Eagle`实现`IFlyable`（企鹅不会飞）；完全不相关的`Airplane`（不是Bird）也能实现`IFlyable`（飞机也会飞）——接口让**继承体系完全不相关**的类，因为"具备同一种能力"被统一对待，这是继承做不到的。继承管"血缘"，接口管"能力"，两者正交，不是从属关系。

**接口"实现"和"继承"的方法覆盖，用词不能混**：一个类"实现（implement）"接口（不用`override`关键字，只要提供匹配的`public`方法/属性即可满足）；一个类"重写（override）"父类的`virtual`/`abstract`方法（必须显式写`override`关键字）——两个是不同的动作，不要混着说。

**接口的实际用途**（不是"锦上添花"，是解决具体问题）：① 多个不相关类需要被统一对待（`IActionResult`、`IFlyable`例子）② 自动化测试时把真实依赖换成假的（比如`IEmailService`换成`FakeEmailService`，Controller代码不用改）③ 依赖注入场景，注册/依赖接口而不是具体类，方便以后换实现。本项目目前还没写过自己的接口（只用了框架自带的`IActionResult`），因为规模还小、还没有自动化测试需求；Week 11补测试时可能会引入。

## 接口（interface）vs API —— 两个不同层面，容易被同一个中文词混淆

- **API（Application Programming Interface）**：系统与系统之间"怎么打交道"的约定，网络层面的概念。我们写的所有Controller合起来就是"我们的API"——一套约定好的"菜单"（有哪些路径、用什么HTTP方法、返回什么格式）。类比：餐厅菜单，顾客不用知道厨房内部怎么做菜，只需要知道菜单上有什么、怎么点。
- **接口（C#语言里的`interface`关键字）**：代码层面的"契约"，规定一个类型必须具备哪些方法/能力，但不规定具体怎么实现。命名习惯以`I`开头。`IActionResult`就是一个接口——规定"必须能被当成HTTP响应处理"，但`Ok()`生成的`OkObjectResult`和`NotFound()`生成的`NotFoundResult`各自内部实现完全不同，外部代码只需要认`IActionResult`这一个类型就能通用处理。类比：`IShape`接口规定"必须有CalculateArea()方法"，`Circle`/`Square`各自用不同公式实现，调用方不用关心具体是什么形状。
- 两者本质不同：一个是"网络架构"概念，一个是"编程语言语法"概念，只是恰好共用中文"接口"这个词。

## 依赖注入（Dependency Injection）—— 完整概念、目的、机制

**概念**：一个类不自己创建它需要用到的依赖（比如数据库连接），而是从外部接收（通常通过构造函数参数）。

**目的（4个价值）**：
1. 解耦——类不需要知道"怎么造"依赖，只需要知道"我需要什么类型"
2. 集中管理——造依赖的"配方"只写一处（`Program.cs`），不用每个用到的类都重复写
3. 改动方便——配方改一次，所有用到的地方自动跟着变
4. 方便测试——能把真实依赖换成假的/模拟的，不用改类本身的代码

**机制，三个步骤**：
1. **注册**（`Program.cs`）：`builder.Services.AddXxx<类型>(配方)`
2. **声明**（消费类，比如Controller）：构造函数参数写上需要的类型
3. **自动提供**（框架完成）：框架创建这个类的实例时，自动按注册的配方造好依赖、传进去

**完整时间线示例（AppDbContext → BankRatesController）**：

*阶段一：应用启动（`dotnet run`时，只发生一次）*
1. `Program.cs`从上到下跑，`AddDbContext<AppDbContext>(...)`只是**登记配方**，不会真的创建任何对象
2. `AddControllers()`登记Controller相关机制
3. `builder.Build()`——DI容器正式建立
4. `app.MapControllers()`——路由接入
5. `app.Run()`——开始监听，启动阶段结束

*阶段二：请求到来（每次访问接口都重新走一遍）*
1. 请求匹配到`BankRatesController.GetAll()`
2. 框架发现`BankRatesController`构造函数需要`AppDbContext`
3. DI容器翻出阶段一登记的配方
4. **这一刻，才真正调用`AppDbContext`自己的构造函数**（`new AppDbContext(options)`第一次真正执行）
5. DI容器把刚造好的`AppDbContext`，传给`BankRatesController`自己的构造函数（`_context = context`）
6. 框架调用`GetAll()`，用`_context`真正查数据库

**两个构造函数（`AppDbContext`的、`Controller`的）永远不会互相调用**，是DI容器在中间牵线搭桥，`Program.cs`只负责提供配方。

**为什么`AppDbContext`的构造函数体是空的也必须存在**：函数体空不代表不需要构造函数——构造函数的"签名"本身（接收`options`、`: base(options)`转交父类）就是必需的工作，父类`DbContext`需要这份配置才能运作，没有这个"入口"，配置就没法传进来（类比：信箱口，信件到了不做特殊处理直接落进屋里，但信箱口本身必须存在）。

**写代码顺序 vs 运行时执行顺序，是两条不同的线**：
- 写代码顺序（因为"引用别的类型前，那个类型必须已经定义"）：Models → Data(AppDbContext) → Program.cs注册 → Controllers
- 运行时执行顺序：Program.cs先跑（只登记）→ 请求来了才真正创建AppDbContext → 再创建Controller

## EF Core 相关

- **ORM（Object-Relational Mapper）**：用对象/类操作数据库，不用手写SQL字符串，EF Core 是 .NET 官方ORM。
- **`DbContext`/`DbSet<T>`/`DbContextOptions<T>` 分工**（类比"档案管理处"）：
  - `DbContext` = 整个档案管理处——代表一整个数据库会话，提供追踪变更、`SaveChanges()`等整体能力
  - `DbSet<T>` = 管理处里一个具体柜子——代表数据库里一张具体的表
  - `DbContextOptions<T>` = 操作说明书/钥匙——告诉管理处怎么连接、用什么驱动
- **database-first vs code-first**：
  - database-first（本项目用的）：数据库已存在（Python的schema.sql建的），C#类照着写。
  - code-first：先写C#类，EF Core 生成/管理数据库结构（用 migrations）。
  - 本项目不用 EF Core migrations，因为表结构由 Python 那边管理。
  - 也可以用 `dotnet ef dbcontext scaffold "连接字符串" Npgsql.EntityFrameworkCore.PostgreSQL -o Models --context AppDbContext --context-dir Data` 一条命令自动反向生成Model+DbContext，本项目选择手写以加深理解。
- **命名转换踩坑（真实遇到过）**：`EFCore.NamingConventions`包的`UseSnakeCaseNamingConvention()`会自动把DbSet属性名（PascalCase复数）转成snake_case去匹配表名，但如果表名本身命名不统一（`housing_affordability`、`housing_sale_price`是单数，`bank_rates`、`fx_rates`是复数），转换结果就可能对不上，导致查询报错"表不存在"。**解决办法**：DbSet属性名要跟着真实表名的单复数走（不要死板地都用复数），实在无法用命名解决的极端情况，可以在`AppDbContext`里override `OnModelCreating`用`.ToTable("真实表名")`显式指定，但优先选择"改属性名匹配"这种更直接、不引入额外配置的方式。
- **User Secrets**：.NET 本地开发专用的密钥存储机制，存在项目文件夹**之外**（`%APPDATA%\Microsoft\UserSecrets\<guid>\secrets.json`），天然不会被提交到git。对应 Python 的 `.env`，但机制不同。`dotnet user-secrets init`（关联项目）+ `dotnet user-secrets set "key" "value"`（设置）+ `dotnet user-secrets list`（查看）。
- **连接字符串格式**：`Host=...;Port=...;Database=...;Username=...;Password=...`（分号分隔），跟 Python 用的 URL 格式（`postgresql://user:pass@host:port/db`）不同，各自生态的约定。

## Controller / HTTP 响应相关

- **`Ok(...)`永远是200，不会自动判断**：不管传什么数据（哪怕null/空列表），`Ok(...)`都固定生成200状态码。要返回错误状态（404/400等），必须自己写判断逻辑，显式调用`NotFound()`/`BadRequest(...)`等对应方法：
  ```csharp
  if (data == null || data.Count == 0) return NotFound();
  return Ok(data);
  ```
- **`[HttpGet]`标在方法上，不是标在Controller上**：一个Controller可以有多个方法，各自用`[HttpGet]`/`[HttpPost]`/`[HttpPut]`等标注不同的HTTP动词，不是"这个Controller只能查询"。
- **路由匹配靠"HTTP动词 + 具体路径"共同确定**，两者都对得上才会调用这一个方法，路径里可以用`{id}`这种占位符绑定到方法参数。
- **`Task<IActionResult>`**：`IActionResult`是真正有意义的返回类型（接口，代表"某种HTTP响应"），外面套的`Task<>`是`async`方法的语法强制要求，跟具体业务无关。其他async方法（非Controller）里，`Task<T>`的`T`可以是任何类型，取决于那个方法实际要产出什么。
- **`Microsoft.AspNetCore.Mvc` vs `HttpClient`**：前者是"接收、响应外部请求"的工具（服务器端，"接线员接电话"），后者是"主动发起外部请求"的工具（客户端，"打电话出去"，以后C#直接调Claude API时会用到）。不管请求是浏览器、Postman还是以后的React发来的，服务器端处理方式完全一样，不需要因为客户端不同而换工具。
- **CORS（跨域资源共享）**：以后接React前端时会遇到——浏览器默认拦截"从一个地址发往另一个地址"的请求，需要在`Program.cs`里加`AddCors(...)`+`UseCors(...)`配置服务器显式允许，到时候展开讲。

## NuGet 包管理 vs pip

- 没有"虚拟环境"概念——每个项目的依赖清单就是 `.csproj` 里的 `<PackageReference>` 列表，包的实际文件缓存在全局共享位置（`~/.nuget/packages/`），但每个项目只用自己声明的版本，互不冲突。
- `dotnet add package 包名` 安装；`dotnet add package 包名 --version x.x.x` 指定版本。
- `dotnet new class -n 名字 -o 路径` 可以直接在指定路径生成类文件骨架（只有空类声明，属性要自己写）。

## 路由（routing）

- 用"特性路由"（attribute routing，写在 Controller 上，`[Route]`/`[HttpGet]`），这是 ASP.NET Core 当前的标准做法，**不需要**、也不应该抽取成一个集中的路由配置文件（那是更老版本 ASP.NET MVC 的过时模式）。

## 开发效率

- 用 `dotnet watch run` 代替 `dotnet run`——监听文件改动，自动重新编译/重启，不用每次手动Ctrl+C重跑（新增Controller这类结构性改动，有时候仍需要完全重启才能生效）。

## 目前用到的包

- `Npgsql.EntityFrameworkCore.PostgreSQL`——PostgreSQL 的 EF Core 驱动（对应 Python 的 psycopg2+SQLAlchemy）
- `Microsoft.EntityFrameworkCore.Design`——提供 `dotnet ef` 命令行工具支持
- `EFCore.NamingConventions`——自动处理 C# PascalCase ↔ PostgreSQL snake_case 命名转换
- `Microsoft.OpenApi` / `Microsoft.AspNetCore.OpenApi`——脚手架自带，生成API文档（Swagger），曾修复过一个高危漏洞（CVE-2026-49451，升级到2.7.5解决）

## 待办 / 下一步

- ~~剩下4张表（bank_rates、fx_rates、housing_affordability、housing_sale_price）照同样模式补 Model + Controller~~ ✅ 已完成，5张表全部有Model+Controller
- `HousingAffordabilityController`里有个效率问题待修（`CountAsync()`多查了一次数据库，应该改用已查出列表的`.Count`属性）
- 个性化分析接口：用户自选指标/城市 + 自定义prompt，C# 直接调 Claude API（不经过 Python），需要`HttpClient`
- React接入时记得处理CORS