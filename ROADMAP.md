# NZ Market Insights — 项目路线图

目标：用 Python + C# + React 做一个 NZ 房产/经济数据分析看板（数据抓取 → 存储 → AI 生成总结 → 前端展示 → 部署上线），边做边补齐 C#/Python 基础，同步准备 NZ IT 岗位面试。周期 2-3 个月。

---

## 技术栈职责划分

| 层 | 技术 | 负责什么 | 不负责什么 |
|---|---|---|---|
| 数据采集/分析 | Python | 抓 RBNZ/Stats NZ 数据、清洗、pandas 分析、调 Claude API 生成文字总结 | 不做对外 HTTP 接口 |
| 后端 API | C# (ASP.NET Core + EF Core) | 读数据库、对外暴露 REST 接口、业务逻辑 | 不直接抓数据、不跑分析 |
| 前端 | React | 调用 C# API，展示图表和 AI 总结文字 | 不直接连数据库/不直接调 Claude API |
| 数据库 | PostgreSQL（Docker → 后期 AWS RDS） | 存原始数据和分析结果 | — |
| AI | Claude API（用你 Console 账户余额） | 生成趋势总结文字 | 不做实时对话功能，一次性批量生成即可 |
| 部署 | Docker + AWS（EC2/RDS） | 让整个系统能公开访问 | — |

数据流向：`Python 抓取/分析 → PostgreSQL → C# API 读取 → React 展示`

---

## 当前进度总览（看这张表就知道自己在哪个阶段，不用数 Week 几）

| Phase | 对应 Week | 内容 | 状态 |
|---|---|---|---|
| Phase 1 | Week 1-2 | Python 抓数据 + 数据库落地 | ✅ 已完成 |
| Phase 2 | Week 3-4 | pandas 分析 + 接入 Claude API | ✅ 已完成 |
| Phase 3 | Week 5-6 | C# Web API（基础 GET + 个性化分析接口） | ✅ 已完成 —— 5张表基础GET接口 + AI个性化分析接口（多态DTO + Service层 + 官方Claude SDK）全部跑通 |
| Phase 4 | Week 7 | React 前端（默认展示 + AI个性化交互 + 用户自主筛选） | ✅ 已完成 —— `HomePage`（默认展示）+ `AnalysisPage`（AI 交互与自主筛选合并成一个页面，含图表、多选筛选、成本控制） |
| **Phase 5** | **Week 8** | **整合联调** | 🔄 **核心链路已验证跑通**（抓数据→存库→C# API→React 展示，含 AI 分析，端到端测试通过），**下一步**：过一遍 Week1-7 剩下的边界情况/错误处理细节 |
| Phase 6 | Week 9-10 | 容器化 + AWS 部署 + 定时任务 + 历史数据追加模式 | 🔄 核心部署+定时任务+自定义域名+Market Insights 功能全链路上线+`load_data.py` 单源故障隔离已完成(详见 [DEPLOYMENT.md](DEPLOYMENT.md))，剩 RDS(暂缓)/趋势图(待数据积累) |
| Phase 7 | Week 11 | 测试 + 文档 + 数据分析深化 | ✅ 已完成 —— 测试+CI/CD+数据深化+README 全部完成 |
| Phase 8 | Week 12 | 收尾与面试冲刺 | 🔄 整体视觉/布局优化已完成，剩简历项目描述、模拟面试自查 |

**进度判断：没有拖沓**——Phase 1+2 实际比计划更快完成（Week1+2 花6天，原计划更长），Phase 3、Phase 4 都已完成，Phase 5 的核心链路验证也已经跑通，仍在正常节奏内，不算落后。

---

## 分周任务与学习要点

> 每周末对照"达成标志"自查，做不到就顺延，不用赶进度，但也不要跳步。

### Phase 1／Week 1 — Python 抓数据 ✅ 已完成（实际花了 5 天，范围比原计划扩大不少，值得）

- **环境与工程习惯**：venv、`.gitignore`、`requirements.txt`（按需增量装包，不一次装全）、git add/commit、GitHub 仓库创建与推送（含账号凭据冲突排查）、VSCode 解释器绑定虚拟环境
- **四个数据源，四个脚本，全部手写**：
  - `fetch_bank_rates.py` —— BNZ 定期存款利率。BNZ 官网本身是 JS 动态渲染、请求不到数据，靠 F12 Network 面板找到背后真实的 JSON API（`api.bnz.co.nz`）直接调用，不再解析 HTML
  - `fetch_fx.py` —— Frankfurter API，NZD 兑 USD/EUR/CNY/AUD/GBP/JPY/SGD 实时汇率
  - `fetch_housing.py` —— 两个数据源合并：住房可负担性指数（HUD，租金/首付/房贷三个维度）+ 真实成交价与每平米价格（data.govt.nz 的 Urban Development 数据集），覆盖奥克兰/惠灵顿/基督城等主要城市
  - `fetch_worldbank.py` —— World Bank API，NZ 通胀率/GDP增长率/失业率，重构成通用函数（`fetch_indicator` + `parse_indicator`，指标代码作为参数），不为每个指标复制文件
- **踩过的坑，也是学到的东西**：RBNZ/REINZ/TradeMe 官网反爬或需登录，逐个排查后找到能用的替代数据源；requests headers 伪装、CSV/JSON 两种格式解析；`sorted()`+`key`+`lambda`；去重模式（`seen` 集合 / 可复用 `deduplicate` 函数）；`pprint` 默认按字母排序的坑；API 服务偶发超时不代表代码错
- **达成标志**：✅ 四个脚本各自独立跑通，数据结构清晰、字段经过筛选（不是原始 API 返回的所有字段都留），为 Week 2 存库做好准备

### Phase 1／Week 2 — 数据库落地 ✅ 已完成（Week 1+2 一共实际花了 6 天，比原计划快）

- **环境**：Docker Compose 跑 PostgreSQL 16，密钥走 `.env`/`.env.example` 分离（不提交真实密码），`schema.sql` 挂载到 `docker-entrypoint-initdb.d` 自动建表；pgAdmin + VSCode PostgreSQL 插件两种方式查库；认识了 `psql`（容器自带，不用额外装）
- **5 张表**：`bank_rates`、`fx_rates`、`housing_affordability`、`housing_sale_price`、`economic_indicators`，`SERIAL` 主键（讨论过 UUID 但判断这里用不上）
- **代码分层（ETL 思路）**：`fetch_*.py`（Extract+初步Transform，不碰数据库）→ `load_data.py`（进一步 Transform，把数据整理成表结构要的形状）→ `db.py`（Load，通用的 `get_connection()` + `replace_table()`，不知道任何具体业务数据）
- **学习要点**：Docker init script 机制、`CREATE TABLE IF NOT EXISTS` 幂等性、参数化查询防 SQL 注入（区分"数据值"和"表名/列名"两种不同的安全处理方式）、`executemany` 批量插入、事务与 `commit()`、`try/finally` 与 `try/except` 的区别（前者只保证清理，不处理异常）、`.items()` 遍历 dict、CSV 字符串"NA"转 `None`、`SERIAL` 序列不会因为 `TRUNCATE` 自动重置
- **踩过的坑**：SQL 忘记分号导致 Docker 初始化脚本整体失败、容器崩溃退出；pgAdmin 缓存不自动刷新；`response.json`/`load_dotenv` 忘记加括号（同一类坑第二次遇到）；`{"BNZ"}` 写成集合而不是字符串
- **达成标志**：✅ 四个抓取脚本的数据全部通过 `load_data.py` 写入 PostgreSQL，5 张表都有真实数据
- **设计决策（已确认，Week 9-10 落地）**：`bank_rates`/`fx_rates`（以及后续新增的贷款利率表）现在是"覆盖式"（每次清空重插，只保留最新快照），会改成"追加式"——每次抓取不再 `TRUNCATE`，而是新增一行，靠 `fetched_at`（日期属性）区分"这是哪一次抓取的历史记录"，从而积累出利率/汇率的变化趋势，而不是只有一张"当前快照"。`housing_*`/`economic_indicators` 不用改，它们的数据源本身自带历史（按年份/日期分多行）

### Phase 2／Week 3-4 — pandas 分析 + 接入 Claude API ✅ 已完成

- **`analyze.py`**：`read_table()` 从 PostgreSQL 读成 DataFrame（用 SQLAlchemy engine，不是裸 psycopg2 连接，避免 pandas 警告），五张表各自一个 `summarize_xxx()` 函数，把原始数据浓缩成"最新值、同比变化、历史均值/最高最低、近期趋势"这类关键统计量（不是甩一整张表给AI，计算这种"必须精确"的事交给代码，AI只负责组织语言）；`get_all_summaries()` 汇总五张表
- **`ai_summary.py`**：官方 `anthropic` SDK，同步调用（不是流式/异步——这是批处理脚本不是并发服务器/交互界面，同步就是对的选择），`claude-haiku-4-5` 模型（任务简单，用最省钱的模型），prompt 明确要求覆盖全部五类数据，`try/except` 兜底 API 调用失败
- **需求澄清（影响后续架构）**：用户自选指标/城市+自定义 prompt 生成个性化分析，这个不在 Python 这边做——已经写进 Week 5-6/7，由 C# 直接调 Claude API（实时请求场景，适合 async；Python 这边的 `ai_summary.py` 只负责定时生成"首页默认总览"）
- **学习要点**：DataFrame 基本操作（筛选/排序/`.diff()`/`.mean()`/`.tail()`/`.iloc[]`切片）、`numpy.float64`/`datetime.date` 不能直接 JSON 序列化、Series vs 标量（`.iloc[0]` 取值 vs 直接对 Series 操作）、字典推导式+`zip()`、"三次重复法则"什么时候该抽象/什么时候不该、AI功能里"代码算数字、AI组织语言"的分工原则
- **踩过的坑**：忘记 `return`（多次）、`year_over_year_change` 硬编码了 `economic_indicators` 的列名，不能直接套用到别的表；prompt 指令没跟着传入数据范围更新，导致 AI 只回答了指令里明确要求的部分，晾着没用其余数据
- **达成标志**：✅ 一次调用生成覆盖通胀/GDP/失业率/房价/可负担性/汇率/银行利率的综合中文分析，包含投资/购房/理财/求职建议

### Phase 3／Week 5-6 — C# Web API 🔄 进行中
- **任务**：ASP.NET Core 项目，EF Core 连同一个 Postgres，写 1-2 个 GET 接口返回数据+总结
- ✅ 5张表基础 GET 接口全部完成（`EconomicIndicatorsController` 等）
- ✅ 已修：`HousingAffordabilityController` 现在用的是 `.Count` 属性，跟 `HousingSalePriceController` 写法一致（原先记录的待修项，实际代码已经是对的，文档没同步）
- ⬜ **新增需求（Phase 2 后期明确的）**：用户自选指标/城市/区域 + 自定义 prompt，实时生成个性化分析（经济形势、理财购房建议等）——这个接口**由 C# 直接调用 Claude API**（用官方 `Anthropic` NuGet包——之前一度以为.NET没有官方SDK、要自己拼JSON发HttpClient，后来查证是记错了，.NET确实有官方SDK），不经过 Python，因为这是实时请求-响应场景，C# 的 async/await 天生适合处理这种"很多用户同时发请求"的情况。查询数据库时按用户选的参数筛选（比如 `WHERE area_name = @area`）
- **学习要点**：Controller、依赖注入、EF Core 模型映射、async/await、LINQ 查询、官方 `Anthropic` SDK 调用、把用户输入和查出来的数据一起拼进 prompt
- **达成标志**：浏览器/Postman 访问 `localhost:5000/api/...` 能拿到 JSON 数据；带参数请求个性化分析接口能拿到 AI 生成的文字

### Phase 4／Week 7 — React 前端
- **任务①（默认展示）**：React 项目调用 C# API，展示一个图表 + AI 总结文字（首页默认总览，覆盖5张表近几年数据）
- **任务②（AI个性化交互）**：下拉框选指标/城市/区域 + 输入框写自定义问题，调用 C# 的个性化分析接口，展示 AI 生成结果
- **任务③（用户自主数据探索，非AI，新增明确的需求）**：区别于②——用户勾选数据类型+年份区间后，**不调用AI，直接展示筛选后的数据本身**（图表/统计数字，比如自己选的这段时间的均值、趋势），这部分依赖 C# 接口支持按查询参数（`[FromQuery]`）筛选，前端单独做一块"数据探索"界面（不是默认首页视图）
- **学习要点**：`fetch`/`useEffect`、组件拆分、图表库（Recharts 或 Chart.js）基础、受控表单（下拉框/输入框状态管理）、CORS 配置（`Program.cs` 里开始需要）
- **达成标志**：浏览器打开页面能看到图表和文字，数据是真实跑通的；用户能自己选参数写问题拿到AI分析；用户也能不经过AI、自己筛选数据看图表/统计

### Phase 5／Week 8 — 整合与补漏
- **任务**：三个部分联调，修 bug，把 Week1-7 落下的细节补上（错误处理、边界情况）
- **学习要点**：调试技巧、跨服务联调思路
- **达成标志**：从抓数据到网页展示，完整跑一遍不报错

### Phase 6／Week 9-10 — 容器化 + AWS 部署 + 数据源扩展
- **任务**：写完整 `docker-compose.yml`（三个服务都容器化），Postgres 迁到 RDS，服务部署到 EC2，配置定时任务定期刷新数据
- **部署核心链路 ✅ 已完成**（原理/步骤/踩坑全部记在 [DEPLOYMENT.md](DEPLOYMENT.md)，这里只列结论）：
  - 三个服务容器化（`db`/`data-service`/`api-service`），`docker-compose.yml` 加了 `healthcheck` 解决启动顺序竞态问题
  - EC2 装 Docker，`git clone` 部署，`.pem`/`.env` 密钥管理到位
  - 前端 S3（私有桶 + CloudFront OAC）+ CloudFront 托管，SPA 路由兜底（403/404 → index.html）
  - API 前面也套了一层 CloudFront（解决 HTTPS 前端请求 HTTP 后端的 Mixed Content 问题），CORS 白名单同步更新
  - 安全组按最小权限配置，WAF 等额外收费项主动避开
  - **`GetAll()` 类接口的"每组取最新一条"（`GroupBy`+`OrderByDescending`）在 Phase 3 写 Controller 时就已经顺手做了，早于这里的计划**，本节原本列的"配套接口改动"里这一项不用再做
- **剩余待办**：~~定时任务（cron/EventBridge）~~ ✅ 已用 cron 完成（每3天自动刷新）、~~自定义域名替换~~ ✅ 已完成（前端 `nz-market-insights.colinl.xyz`，ACM 证书 + Cloudflare DNS + CloudFront Alternate domain）、Postgres 迁 RDS（暂缓，优先级低）、bank_rates/fx_rates 的历史趋势查询接口+前端 Trend 图表（暂缓，历史数据积累不够）
- **新增数据源——贷款利率（loan interest rates）✅ 已完成**：`fetch_loan_rates.py` + `LoanRatesController`/`LoanRateService` + 前端 `LoanRateChart` 全部落地，BNZ 房贷利率已接入
- **可选数据源清单（backlog，做首页"专业感"审查时对照Trading Economics/interest.co.nz等主流平台找出的缺口，已做过一轮可行性验证，仅记录不阻塞主线，有余力再补，没时间就跳过）**：
  - **OCR官方现金利率**（比银行存款利率更根本的驱动因素）：🟡 RBNZ官网被Cloudflare拦截（跟Week1抓RBNZ时同样的情况），但BNZ当初也是靠F12找到官网背后的JSON API绕过去的，OCR可能有类似的路，没验证过，值得到时候花点时间试
  - **零售销售（Retail Sales）**：🟡 Stats NZ 有相关数据但搜到的是2015-2017年旧数据集，不确定是否持续更新；Stats NZ 的 **Infoshare** 工具（`infoshare.stats.govt.nz`）确认不需要登录、可直接导出CSV，大概率能找到，但需要到时候手动在分类目录里导航定位
  - **建筑许可（Building Consents）**：🟡 没找到全国层面数据集，只有零散的地区议会数据，全国数据大概率也在 Stats NZ Infoshare 里，需要到时候手动导航
  - **商业信心指数PMI/PSI（BusinessNZ）**：❌ 官网403拦截，没找到可下载CSV/API，优先级低
  - **企业/消费者信心指数（ANZ）**：❌ 只找到PDF报告，没有API/CSV，优先级最低
- **历史数据追加模式 ✅ 已完成**：`bank_rates`/`fx_rates`/`loan_rates` 都已切成"追加式"（`keep_history_table`，靠 `fetched_at` 区分历史记录），不再是每次清空重插的快照
- **配套的接口改动**：
  - ✅ `GetAll()` 类接口的"每组只取最新一条"（`GroupBy`+`OrderByDescending`+`First`）——Phase 3 写 Controller 时就顺手做了
  - ⬜ 主页"利率/汇率变化趋势图"需要**另一个专门的历史查询接口**，返回完整时间序列，还没做（详见 [DEPLOYMENT.md](DEPLOYMENT.md) 待办部分）
- **学习要点**：Dockerfile 编写、Linux 命令行操作（SSH、systemd/cron、看日志）、AWS 基础（EC2/RDS/安全组/CloudFront/S3）、"追加式"存储的表设计思路（依赖时间字段而不是主键去重）、Mixed Content/CORS 两层跨域安全机制的区别
- **达成标志**：✅ 有一个公网可访问的链接，点开是活的看板（`https://d964krhr6mofu.cloudfront.net`）；⬜ `bank_rates`/`fx_rates`/贷款利率能看到随时间积累的历史记录，不再只有最新一条——数据库层面已具备，前端展示还没做

---

## 网站专业性打磨清单（页面功能完善，Phase 6 之后、独立于 Phase 7 数据深化，优先做这个）

历史数据目前太少（cron 刚开始每 3 天积累一次），趋势图暂缓；先把已有数据的**展示质量**打磨到位，这是一个"专业经济分析网站"该有的基本盘。逐项过一遍代码后确认的具体缺口：

- **数据来源与更新时间标注 ✅ 已完成**（原始诉求）：`utils/format.ts` 加了 `formatDate()`，`FxRateChart`/`BankRateChart`/`LoanRateChart` 副标题都改成动态拼接真实 `fetchedAt` + 数据来源（Frankfurter API / BNZ）。KPI 卡片的来源说明（World Bank）暂缓未加。
- **数字格式统一 ✅ 已完成**（原始诉求）：`utils/format.ts` 加了 `formatNumber()`（`Intl.NumberFormat`，只设 `maximumFractionDigits` 不设最小值，整数不会被硬凑小数、大数字自动千分位）；`chartTheme.ts` 的 `chartBase()` 统一给所有图表的 tooltip 加了 `valueFormatter`，一处改动全图表生效；`KpiCard.tsx` 用上了格式化 + `unit="%"`。
- **加载状态缺失 ⏸ 暂缓**（今天看代码顺带发现的，非原始诉求）：`useFetchData.ts` 没有 `isLoading`/`error` 状态。评估后判断优先级不高——API 响应快，实际加载窗口很短，用户大概率感知不到；而且改动会牵连 `HomePage.tsx`（6处）+`AnalysisPage.tsx`（5处）调用，波及面比预期大。暂不做，以后觉得有必要再拾起。

### Phase 7／Week 11 — 测试与文档 + 数据分析深化
- **任务**：补 xUnit（C#）/pytest（Python）基础测试，完善 README（架构图、运行方式、技术亮点）
- **测试 ✅ 已完成**（按 NZ 全栈岗位实际要求校准范围，不是照搬 QA/SDET 岗位的工具栈——具体取舍见对话记录，未来可以补进文档）：
  - **C#（xUnit，`ApiService.Tests/`）**：单元测试覆盖 `BankRateService`/`FxRatesService`/`LoanRateService` 的 `GroupBy` 去重+筛选逻辑（6个）；集成测试用 `WebApplicationFactory` + EF Core InMemory 起内存测试服务器，真实发 HTTP 请求测 `GET /api/BankRates`（404/200 两种状态码）和 `POST /api/Analysis`（3个）。为了让 `AnalysisController` 可测，把 `ClaudeService` 抽出了 `IClaudeService` 接口（依赖倒置），测试里换成 `FakeClaudeService`，不会真的调用付费 AI API。共 9 个测试全过。
  - **Python（pytest，`data-service/tests/`）**：测 `fetch_*.py` 里的纯解析函数（`parse_prices`/`parse_loan_rates`/`parse_csv`/`na_to_none`），覆盖正常输入+边界情况（缺字段、空数据）。`pytest.ini` 配了 `pythonpath = src`。共 10 个测试全过。
  - **前端（Vitest，`web-client/src/utils/format.test.ts`）**：只测 `utils/format.ts` 的纯函数（`formatDate`/`formatNumber`），组件本身不写测试（逻辑密度低，投入产出比不划算，判断依据同上）。共 5 个测试全过。
  - **范围边界**：不用 Playwright/Cypress 端到端测试、不做 k6/JMeter 压测、不做 WCAG 无障碍审查——这些是专职 QA/SDET 岗位的工具栈，跟这个项目瞄准的全栈开发岗位不匹配，引入了反而像是对工具适用场景判断力不够。
- **数据分析深化 ✅ 已完成**（`data-service/notebooks/deep_analysis.ipynb`，Phase 2 结束时明确推迟到这里做，全栈主线走完再补）：
  - **数据源**：`economic_indicators`(通胀/GDP/失业率，World Bank) × `housing_sale_price`/`housing_affordability`(HUD，全国口径 `area_type='NZ'`) × `bank_rates`/`loan_rates`(BNZ) × `fx_rates`。`bank_rates`/`loan_rates`/`fx_rates` 历史积累不够(cron才跑一周)，相关的趋势类分析(利率趋势、汇率趋势、外币计价房价趋势)明确记录为"设计好、待数据积累后实现"，不硬做
  - **SQL JOIN vs pandas merge 对比**：`economic_indicators` 用 SQL 的 `CASE WHEN`+`GROUP BY` 手动转宽表，再用 SQL `JOIN`+CTE 接 `housing_sale_price`；`housing_affordability`(季度数据)则用 pandas `groupby().mean()` 聚合到年度，再用 `merge()` 接入——同一类"关联"操作，两种技术各用一次做对比
  - **9 个分析**：① 相关系数矩阵总览(`seaborn.heatmap`) ② 失业率 vs 三个可负担性维度的回归(发现失业率只显著影响"存首付"，对房贷/租金不显著) ③ GDP增长率 vs 房价-成本比(PCR)回归 ④ **多元回归**(`statsmodels` OLS，通胀+GDP+失业率一起预测PCR，发现GDP是唯一稳健显著的、失业率的单变量效应控制住GDP后基本消失) ⑤ **建筑许可数量的领先指标检验**(lag correlation，发现同期相关性反而比领先一年更强，不支持"许可预示未来房价"的假设) ⑥ 通胀调整后的真实房价(`cumprod`累积物价指数，发现房产19年真实跑赢通胀约48%，且能看出2020-21疫情异常尖峰+2022-23加息回调) ⑦ 定存vs房贷利率利差(`DISTINCT ON`取每期限最新快照，期间修了一个真实的期限字符串单复数不一致导致 merge 漏配的坑) ⑧ **区域对比**(奥克兰/惠灵顿等6个主要城市，发现"最贵城市"和"可负担性最差城市"不是同一个——惠灵顿价格比奥克兰低但存首付可负担性更差) ⑨ 房价折算主要外币(给外国投资者视角)
  - **过程中两次数据误判并主动核实纠正**：一次是可负担性指数方向搞反了(以为数值越高越容易负担，查证 [data.govt.nz 官方说明](https://catalogue.data.govt.nz/dataset/d9585bff-7f6a-49c5-8fb0-5a6ce23e32c7)后发现是反的，重新解读了所有相关结论)；一次是 PCR 定义核实(查证确认就是 price/cost，原判断没错)。这两次核实本身也是分析过程该有的部分，写进了 Notebook 的方法论说明里
  - **中英双语**：全篇 Markdown 说明(标题、每节导语、每个结果的解读、Key Findings)都是英文在前、中文紧跟其后
  - **⑩ 投资决策信号**(4个子分析，专门对应"这值不值得买/现在买不买/风险多大/钱该往哪放"这几个投资者会问的问题，不是为了多而加)：现价PCR相对20年均值 **-11.1%**(z-score -1.19，说明现在相对历史正常水平不算贵)；真实房价相对2021年高点回撤 **-23.8%**；年涨幅波动率(7.36个百分点)**超过**平均年涨幅本身(4.93%)，说明逐年看风险不低；房产19年真实年化收益(2.10%/年)跑赢按当前利率算的定存真实收益(1.06%/年)和闲置现金(-2.84%/年)，但领先定存的幅度温和不悬殊——四项结果彼此呼应，指向一个和"NZ房产永远贵、永远涨"的流行印象不完全一致的、更 nuanced 的结论
  - **达成标志**：✅ 一份"跨数据源"的分析结论(见上，10项，含图表，中英双语)
- **CI/CD ✅ 已完成**（`.github/workflows/ci-cd.yml`）：`push`/`pull_request` 自动并行跑三边测试（`dotnet test`+`pytest`+`vitest run`）。额外加了一个 `deploy` job 做 CD——`workflow_dispatch`（手动点击触发，不会自动跑）+ `needs` 依赖三个测试 job 全过才执行，用 `appleboy/ssh-action` SSH 到 EC2 跑 `git pull && docker compose up -d --build`。**故意没有在仓库 Secrets 里配置 `EC2_HOST`/`EC2_SSH_KEY`**，流程完整可用但不会真的触发部署，避免风险，以后需要真启用时自己去仓库设置里加这两个 Secret 即可。YAML 语法已本地校验通过，还没有通过真实 push 触发验证过 Actions 实际运行结果。
- **学习要点**：xUnit/pytest/Vitest 写法、`WebApplicationFactory`+EF Core InMemory 集成测试、依赖倒置（为可测试性抽接口）、技术文档写作、SQL JOIN/窗口函数、pandas 进阶聚合、数据可视化基础、简单线性回归、CI/CD 基础概念（GitHub Actions workflow 语法、`needs`/`if`/`workflow_dispatch`）
- **达成标志**：✅ 三边测试全部写完且本地全过（C# 9个 + Python 10个 + 前端 5个）；✅ CI/CD workflow 写完并已 push 到 GitHub 真实验证跑通（三个 job 全绿，`Status: Success`）；✅ 至少一份"跨数据源"的分析结论和对应图表（`deep_analysis.ipynb`，6项分析）；✅ `README.md` 完善（中英双语，架构图+技术栈+功能说明+工程笔记，面向面试官/雇主）
- **项目结构性覆盖不到、但NZ市场DA岗位明确要求的两项（建议项目外单独练，不适合硬塞进这个full-stack项目）**：进阶Excel（复杂公式/透视表/PowerQuery）、Power BI/Shiny 仪表盘经验——这两个是具体工具技能，跟"你能不能写代码"是两回事，如果目标岗位偏DA，建议找时间单独用这个项目的同一份数据在Power BI里做1-2个仪表盘练手，跟主项目脱钩、不影响主线进度

### Phase 8／Week 12 — 收尾与面试冲刺 🔄 进行中
- **任务**：项目打磨（UI 细节、代码整理）、简历项目描述写好、模拟面试自查
- **整体视觉/布局优化 ✅ 已完成**：全站从暗色主题改成浅色/白底主题，主色从翡翠绿换成钢蓝色（单一协调色板、按图表主题分配不同色相，柱状图加浅→深渐变），导航栏改成半透明磨砂+黑白渐变过渡；自定义 checkbox（开关样式用于分类启用/AI分析勾选，圆形对勾+弹跳动画用于多选列表）、自定义下拉菜单、年份/日期筛选从原生 datalist 改成真正的 `<select>`（选项直接来自数据库实际范围，不能手动乱输）；修了一批图表布局问题（LoanRateChart 高度压缩、HousingSalePriceChart 偏右、多个筛选下拉排序不对、"Auckland" 因为 TA/EUA 两种地理口径撞名重复显示两次）；清理了残留的开发期占位文案（首页标题"In Progress"、Section 标题里硬编码的"Til 2025"、AI 按钮上的"paid API"备忘条）
- **Market Insights 功能全链路上线（原计划外，做完顺带完成）**：`market_insights` 表手动建表（`schema.sql` 只在数据卷全新时自动跑，已有数据的实例改表结构必须手动 `CREATE TABLE`）、`compute_insights.py` 跑通并补上遗漏的生产依赖（`scipy` 之前只在 `requirements-dev.txt`，导致容器里 `ModuleNotFoundError`）
- **数据管道健壮性修复（原计划外）**：`load_data.py` 原来五个抓取函数顺序执行、无错误处理，`load_fx_rates`（Frankfurter API 超时）崩溃直接导致排在它后面的 `load_economic_indicators`/`load_housing` 静默不执行——改成每个源独立 try/except，一个源失败不拖累其他；顺带把偏紧的 10 秒超时调宽到 25 秒
- **达成标志**：能流畅讲清楚"这个项目做了什么、为什么这样设计、遇到什么问题怎么解决的"；⬜ 简历项目描述；⬜ 模拟面试自查

---

## 面试准备（贯穿全程，不要留到最后）

- 每周固定 3-4 小时刷 `interview-prep` 仓库里的题（数组、字符串、递归、排序、基础 DP），C#/Python 各写一遍同一题
- 到 Week 8 左右开始整理"项目讲解稿"草稿，越早开始讲得越顺
- NZ 面试常见还会问：为什么选这个技术栈、怎么做的取舍、如果重来会怎么改——提前想好答案

---

## 容易漏掉但很重要的点

1. **密钥安全**：Claude API key、数据库密码全部走环境变量/`.env`，`.gitignore` 从第一天就配好，不要等到要发 GitHub 才想起来
2. **AWS 费用**：用 Free Tier 额度内的实例规格（如 `t2.micro`/`t3.micro`），部署前设置账单告警（Billing Alarm），避免忘关实例被扣费
3. **数据源使用限制**：RBNZ/Stats NZ 数据抓取要看有没有速率限制或使用条款，写爬虫时别高频请求，加个间隔
4. **范围控制**：这是个 2-3 个月的学习项目，不是创业产品——功能想加什么"以后再说"，先让主链路跑通，这个诱惑在 Week 5-7 最容易出现（想给 API/前端加一堆额外功能）
5. **Git 提交习惯**：从 Day 1 开始正常提交（小步提交、commit message 说清楚做了什么），面试官看 commit 历史也会加分，不要写完整个项目才一次性提交
6. **日志**：Python 抓数据脚本、C# API 都加基础日志（哪怕就是 print/ILogger），Week 9 部署到 AWS 后排查问题全靠日志
7. **数据更新频率**：想清楚这个看板是"一次性跑一下"还是"定期自动刷新"，决定了 Week 9-10 要不要配定时任务（cron/AWS EventBridge）

---

## 需要用到的 Claude Code Skills（当前环境已内置，直接用 `/名称` 调用）

| Skill | 什么阶段用 | 用来做什么 |
|---|---|---|
| `run` | 每个阶段做完 | 启动项目、在浏览器里实际验证功能，而不是只看代码 |
| `verify` | 每次改动后 | 确认改动真的达到预期效果，不是想当然 |
| `code-review` | 每周任务做完 | 让自己代码过一遍审查，学到规范写法，也是良好习惯 |
| `security-review` | Week 4（接 API key）、Week 9-10（部署） | 检查密钥管理、AWS 配置有没有明显安全隐患 |
| `dataviz` | Week 7（React 图表） | 图表配色、布局设计，做出来的看板不会太丑 |
| `init` | Week 1 项目搭好后 | 给 `nz-market-insights` 仓库生成一份 `CLAUDE.md`，让以后每次开新会话都有项目上下文 |

## 建议再装的 VS Code 插件（C# Dev Kit / Python 已装好，这些是新增的）

- **Docker**（微软官方）—— 管理容器、看日志，不用切到命令行
- **PostgreSQL**（如 `ckolkman.vscode-postgres` 或 SQLTools + Postgres 驱动）—— 在 VSCode 里直接查数据库
- **REST Client** 或 **Thunder Client** —— 测试 C# API 接口，不用装 Postman
- **ES7+ React/Redux snippets** + **Prettier** —— React 开发效率和格式统一
- **AWS Toolkit**（Week 9-10 用）—— 管理 EC2/RDS，不用来回切浏览器控制台