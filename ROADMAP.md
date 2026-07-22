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
| **Phase 4** | **Week 7** | **React 前端（默认展示 + AI个性化交互 + 用户自主筛选）** | 🔄 **下一步** |
| Phase 5 | Week 8 | 整合联调 | ⬜ 未开始 |
| Phase 6 | Week 9-10 | 容器化 + AWS 部署 + 定时任务 + 历史数据追加模式 | ⬜ 未开始 |
| Phase 7 | Week 11 | 测试 + 文档 + 数据分析深化 | ⬜ 未开始 |
| Phase 8 | Week 12 | 收尾与面试冲刺 | ⬜ 未开始 |

**进度判断：没有拖沓**——Phase 1+2 实际比计划更快完成（Week1+2 花6天，原计划更长），Phase 3 目前完成了"基础GET接口"这部分，剩下"个性化分析接口"是 Phase 3 的下一步，仍在正常节奏内，不算落后。

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
- ⬜ 待修：`HousingAffordabilityController` 里多余的 `CountAsync()` 查询，改用已查出列表的 `.Count` 属性（和 `HousingSalePriceController` 保持一致写法）
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
- **新增数据源——贷款利率（loan interest rates）**：目前只抓了 BNZ 定期存款利率（`bank_rates`），需要补充贷款利率（比如房贷利率）。开始这项时先做一遍数据源可行性研究（类似 Week1 找 BNZ API 的方式，看 BNZ/其他银行的官网或 API 有没有现成的贷款利率接口），确认可行后新增 `fetch_loan_rates.py` + 对应表
- **可选数据源清单（backlog，做首页"专业感"审查时对照Trading Economics/interest.co.nz等主流平台找出的缺口，已做过一轮可行性验证，仅记录不阻塞主线，有余力再补，没时间就跳过）**：
  - **OCR官方现金利率**（比银行存款利率更根本的驱动因素）：🟡 RBNZ官网被Cloudflare拦截（跟Week1抓RBNZ时同样的情况），但BNZ当初也是靠F12找到官网背后的JSON API绕过去的，OCR可能有类似的路，没验证过，值得到时候花点时间试
  - **零售销售（Retail Sales）**：🟡 Stats NZ 有相关数据但搜到的是2015-2017年旧数据集，不确定是否持续更新；Stats NZ 的 **Infoshare** 工具（`infoshare.stats.govt.nz`）确认不需要登录、可直接导出CSV，大概率能找到，但需要到时候手动在分类目录里导航定位
  - **建筑许可（Building Consents）**：🟡 没找到全国层面数据集，只有零散的地区议会数据，全国数据大概率也在 Stats NZ Infoshare 里，需要到时候手动导航
  - **商业信心指数PMI/PSI（BusinessNZ）**：❌ 官网403拦截，没找到可下载CSV/API，优先级低
  - **企业/消费者信心指数（ANZ）**：❌ 只找到PDF报告，没有API/CSV，优先级最低
- **历史数据追加模式（之前"待定"的决策，现已确认要做）**：`bank_rates`/`fx_rates`/新增的贷款利率表，把"覆盖式"（每次 `TRUNCATE` 重插，只留最新快照）改成"追加式"——每次抓取新增一行而不是清空重插，靠 `fetched_at` 这个日期属性区分"这一行是哪次抓取产生的历史记录"，这样才能积累出利率/汇率随时间变化的趋势，而不是只有一张当前快照。这一步要和定时任务一起配置，避免定时抓取时把历史记录覆盖掉
- **配套的接口改动（Phase 3 写 `BankRatesController`/`FxRatesController` 时发现的，先记录，Phase 6 落地）**：切到追加式存储后，同一个 bank+term（或 fx 的 base+target）会同时存在多条历史记录，届时：
  - 现有的"当前利率/汇率"`GetAll()` 接口要改成"每组只取最新一条"（`GroupBy` + 取每组最新，比现在的筛选写法更进一步）
  - 主页"利率/汇率变化趋势图"需要**另一个专门的历史查询接口**，返回完整时间序列（数据形状跟"当前快照"不同），不能直接复用 `GetAll()`
- **学习要点**：Dockerfile 编写、Linux 命令行操作（SSH、systemd/cron、看日志）、AWS 基础（EC2/RDS/安全组）、"追加式"存储的表设计思路（依赖时间字段而不是主键去重）、`GroupBy` 取每组最新记录的 LINQ 写法
- **达成标志**：有一个公网可访问的链接，点开是活的看板；`bank_rates`/`fx_rates`/贷款利率能看到随时间积累的历史记录，不再只有最新一条

### Phase 7／Week 11 — 测试与文档 + 数据分析深化
- **任务**：补 xUnit（C#）/pytest（Python）基础测试，完善 README（架构图、运行方式、技术亮点）
- **数据分析深化**（Phase 2 结束时明确推迟到这里做，全栈主线走完再补）：
  - 用 SQL JOIN 现有5张表做跨数据源分析（比如房价 vs 利率、通胀 vs 失业率，按年份关联）
  - 用 pandas `groupby`/`merge`/`pivot_table` 重做一遍同样的分析，对比"SQL JOIN" vs "pandas merge"两种做法
  - 挑1-2个关键图表用 `matplotlib`/`seaborn` 画出来（比如"过去20年通胀率和房价走势"）
  - 基础相关性分析（比如房价和利率的相关系数）+ 一个简单线性回归（比如"用利率预测房价"），覆盖NZ招聘要求里常见的"statistics modelling"这个点，不只是相关系数
  - 目的：这个项目主要练全栈，但用户希望"全栈+数据"两边都要能达到找工作的技术门槛，这几项是数据岗位面试常考、但项目主线不会自然覆盖到的部分
- **CI/CD（NZ full-stack招聘要求里明确提到，目前项目完全没有，成本低、信号强，值得补）**：写一个 GitHub Actions workflow，push代码时自动跑 C# 的 xUnit 测试 + Python 的 pytest 测试（先跑通"自动测试"这一步，构建/部署自动化可以留到更熟练再加）
- **学习要点**：单元测试写法、技术文档写作、SQL JOIN/窗口函数、pandas 进阶聚合、数据可视化基础、简单线性回归、CI/CD 基础概念（GitHub Actions workflow 语法）
- **达成标志**：`README.md` 能让一个陌生人看懂项目并跑起来；有至少一份"跨数据源"的分析结论和对应图表；push代码能自动触发测试并看到通过/失败结果
- **项目结构性覆盖不到、但NZ市场DA岗位明确要求的两项（建议项目外单独练，不适合硬塞进这个full-stack项目）**：进阶Excel（复杂公式/透视表/PowerQuery）、Power BI/Shiny 仪表盘经验——这两个是具体工具技能，跟"你能不能写代码"是两回事，如果目标岗位偏DA，建议找时间单独用这个项目的同一份数据在Power BI里做1-2个仪表盘练手，跟主项目脱钩、不影响主线进度

### Phase 8／Week 12 — 收尾与面试冲刺
- **任务**：项目打磨（UI 细节、代码整理）、简历项目描述写好、模拟面试自查
- **达成标志**：能流畅讲清楚"这个项目做了什么、为什么这样设计、遇到什么问题怎么解决的"

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