# 测试笔记（TESTING）

给自己复习用，梳理测试相关每个文件是干什么的、彼此怎么关联。覆盖率数据和"测了什么/没测什么"的详细分析见对话记录，这份文档专注"文件地图"。

## 整体结构

```
nz-market-insights/
├── ApiService.Tests/          C# 测试项目（独立 .csproj，原因见下）
│   ├── Services/               单元测试：Service 层业务逻辑
│   └── Integration/            集成测试：真实发 HTTP 请求测接口
├── data-service/
│   ├── tests/                  Python 测试
│   ├── pytest.ini              告诉 pytest 去哪找 src/ 下的代码
│   └── requirements-dev.txt    测试专用依赖（生产镜像不需要）
├── web-client/
│   └── src/utils/format.test.ts   前端测试
└── .github/workflows/ci-cd.yml    自动化：push 时跑测试 + 手动触发部署
```

## C#：`ApiService.Tests/`

**为什么是独立文件夹/独立 `.csproj`**：.NET 项目会自动把文件夹下所有 `.cs` 文件编译进去，测试代码和测试专用包（xUnit 等）不能混进生产的 `ApiService.csproj`，不然 Docker 镜像会把测试依赖也打包进去。所以测试代码必须是完全独立的项目，只是通过 `dotnet add reference` 引用主项目，能"看到"主项目的类，但主项目看不到它。

### `Services/` —— 单元测试（不碰真实数据库）

| 文件 | 测的是哪个类 | 核心逻辑 |
|---|---|---|
| `BankRateServiceTests.cs` | `api-service/Services/BankRateService.cs` | `Query()` 方法的 `GroupBy` 去重（同 bank+term 多条历史记录只留最新一条）+ 筛选条件 |
| `FxRatesServiceTests.cs` | `FxRatesService.cs` | 同上，按 base+target 分组 |
| `LoanRateServiceTests.cs` | `LoanRateService.cs` | 同上，按 bank+product+term 分组 |

三个文件结构完全一样：`CreateContext()` 造一个连着"内存假数据库"（EF Core InMemory）的 `AppDbContext`，绕开真实 Postgres；每个 `[Fact]` 方法都是"塞几条测试数据 → 调用 `Query()` → 断言结果对不对"这个套路。

### `Integration/` —— 集成测试（真实发 HTTP 请求，测多个部分协同工作）

| 文件 | 作用 |
|---|---|
| `TestWebApplicationFactory.cs` | **核心基础设施**。起一个跟真实 `api-service` 一模一样的内存测试服务器，但把 `Program.cs` 里注册的真实 Postgres 连接、真实付费 AI 服务，替换成测试专用的假实现。下面所有集成测试都靠它启动服务器。 |
| `FakeClaudeService.cs` | `IClaudeService` 接口的假实现，只在测试里用，直接返回一句固定文字，不发网络请求、不花钱。被 `TestWebApplicationFactory` 用来替换掉真实的 `ClaudeService`。 |
| `BankRatesEndpointTests.cs` | 真的发 `GET /api/BankRates` 请求，测两种情况：查不到数据返回 404、查到数据返回 200+正确内容。用 `TestWebApplicationFactory` 起的测试服务器。 |
| `AnalysisEndpointTests.cs` | 真的发 `POST /api/Analysis` 请求（带一个模拟的 JSON body），验证走到 `FakeClaudeService` 那条路径能正常返回结果，不会真的调付费 API。 |

### 联动的主项目改动（不在测试文件夹里，但是为了能测才改的）

| 文件 | 改了什么 | 为什么 |
|---|---|---|
| `api-service/Services/IClaudeService.cs`（新建） | 定义接口：`Task<string> GenerateAnalysis(string prompt)` | 让 `AnalysisController` 依赖"抽象契约"而不是"具体类"，测试时才能换成 `FakeClaudeService` |
| `ClaudeService.cs` | `class ClaudeService` → `class ClaudeService : IClaudeService` | 声明"我实现了这个接口" |
| `Program.cs` | `AddScoped<ClaudeService>()` → `AddScoped<IClaudeService, ClaudeService>()` | 注册"接口→实现"的映射，不是注册具体类 |
| `AnalysisController.cs` | 构造函数参数类型 `ClaudeService` → `IClaudeService` | 依赖接口，不知道也不关心背后是真的还是假的实现 |

## Python：`data-service/`

| 文件 | 作用 |
|---|---|
| `pytest.ini` | 一行配置 `pythonpath = src`，告诉 pytest 去 `src/` 目录下找 `fetch_bank_rates` 这些模块，不然 `from fetch_bank_rates import parse_prices` 会报"找不到模块" |
| `requirements-dev.txt` | `-r requirements.txt` + `pytest`——测试专用依赖单独列一份，不混进生产用的 `requirements.txt`（生产 Docker 镜像不需要装 pytest），跟 C# 测试项目独立的道理一样 |
| `tests/test_fetch_bank_rates.py` | 测 `parse_prices`（BNZ 存款利率 JSON 解析：正常提取、跳过 duration=0 的条目、空数据）+ `deduplicate`（去重工具函数） |
| `tests/test_fetch_loan_rates.py` | 测 `parse_loan_rates`（BNZ 房贷利率 XML 解析，含前后空格被 `.strip()` 正确处理的边界情况） |
| `tests/test_fetch_housing.py` | 测 `parse_csv`（房价/可负担性 CSV 转 list of dict） |
| `tests/test_load_data.py` | 测 `na_to_none`（CSV 里的 "NA" 字符串转成真正的 `None`） |

四个测试文件对应的都是**纯函数**（给定输入、固定产出，不碰网络不碰数据库）——这也是当初挑这几个函数当测试重点的原因，天然适合单元测试，不需要额外的"假数据库"这类基础设施（这点跟 C# 不一样，C# 测的是要连数据库的 Service 层，所以需要 EF Core InMemory；Python 测的是数据抓取后的解析逻辑，本身就是纯计算）。

## 前端：`web-client/src/utils/format.test.ts`

测 `utils/format.ts` 里的 `formatDate`/`formatNumber`——同目录下配套的测试文件，Vitest 会自动识别 `*.test.ts` 命名的文件。只测这一个文件，因为这是前端代码里唯一有"真逻辑"（日期解析、数字舍入进位）的部分，其他组件主要是声明式的图表配置，没有值得测的分支逻辑。

## `.github/workflows/ci-cd.yml`

一个文件里装了 CI 和 CD 两件事，用不同触发条件区分：

- **`dotnet-tests`/`python-tests`/`frontend-tests`** 三个 job：`push`/`pull_request` 时自动并行跑，分别对应上面三套测试
- **`deploy`** job：只有手动去 GitHub 网页点 "Run workflow" 才会跑（`workflow_dispatch`），而且要等三个测试 job 全过（`needs`）才会执行，跑的是 SSH 连 EC2 执行 `git pull && docker compose up -d --build`。故意没配 Secrets，所以这一步目前还不会真的连到你的服务器。

## 关键概念速查（跟 `api-service/NOTES.md` 联动，不重复展开）

- **单元测试 vs 集成测试**：单元测试只测一个方法/函数本身，不碰外部资源；集成测试测多个部分协同工作（HTTP请求→路由→Controller→Service），可以用假的数据库但要走真实的请求链路
- **依赖倒置（`IClaudeService`）**：代码依赖"抽象契约"而不是"具体实现"，测试时才能替换成假的
- **`DbContextOptions`/`UseInMemoryDatabase`**：给 `AppDbContext` 换一份指向"内存假数据库"的配置说明书，`AppDbContext` 自己的代码完全不用改
- **`WebApplicationFactory`**：起一个内存里的完整测试服务器，能真实处理 HTTP 请求，不用真的监听端口、不用真的部署