# 部署笔记（DEPLOYMENT）

给自己复习用，记录 Phase 6 部署这一段涉及到的架构、原理、踩过的坑。跟 `api-service/NOTES.md`（C#概念笔记）是同一个路数，只是这份不属于单个模块，覆盖的是整条部署链路。

## 整体架构

```
                          ┌─────────────────────────────┐
浏览器 ──HTTPS──► CloudFront #1 ──► S3（私有桶，静态文件）
（用户）          d964krhr6mofu                          │
                  .cloudfront.net                        │
                          │                               │
                          │ 页面里的 fetch() 请求          │
                          ▼                               │
                  CloudFront #2 ──HTTP──► EC2:8080         │
                  d5jq7yghv598l           （api-service    │
                  .cloudfront.net          容器）          │
                                                │           │
                                                ▼           │
                                          EC2 内部 Docker 网络
                                          db 容器（Postgres）
                                                ▲
                                                │
                                          data-service 容器
                                          （一次性脚本，抓数据写库）
```

**两个 CloudFront 是两件独立的事**：一个专门代理前端静态文件（源是 S3），一个专门代理后端 API（源是 EC2）。不是"一个 CloudFront 管全部"，而是"每个源站配一个 CloudFront 入口"。

## 各组件是什么、解决什么问题

### Docker / Dockerfile / docker-compose
- **Dockerfile**：一份"怎么把这个服务打包成一个可运行镜像"的说明书（用什么基础环境、装什么依赖、启动命令是什么）。`api-service` 用多阶段构建（build 阶段编译 .NET，run 阶段只留运行时，镜像更小）；`data-service` 单阶段就够（Python 不需要编译）。
- **docker-compose.yml**：把多个容器（`db`/`data-service`/`api-service`）当成一个整体来定义、启动、联网。不用 compose 的话，得手动一个个 `docker run`、手动建网络、手动传参数，容易出错。
- **本地开发 vs 服务器部署，用的是同一份 `docker-compose.yml`**——这是容器化的核心价值：开发环境和生产环境跑的是同一套定义，不会出现"我本地能跑，服务器跑不起来"。

### EC2 是什么
一台云端虚拟机，本身只是"宿主"——Docker 引擎装在它上面，三个容器共享它的 CPU/内存/网络资源，容器之间靠 Docker 内部虚拟网络（`nz-market-insights_default`）互相访问，用**服务名**当地址（比如 `data-service` 连数据库用的是 `POSTGRES_HOST=db`，不是 IP）。

### `depends_on` + `healthcheck`（今晚踩的第一个坑）
- **问题**：`depends_on: - db` 只保证 `db` **容器启动**，不保证 Postgres **进程真正能接受连接**。Postgres 第一次启动还要跑 `schema.sql` 初始化，这几秒内容器算"活的"但端口没监听，`data-service` 抢跑连接就会 `Connection refused`。
- **解法**：给 `db` 加 `healthcheck`（用 Postgres 自带的 `pg_isready` 定期探测），`data-service`/`api-service` 的 `depends_on` 从简单的服务名列表改成 `condition: service_healthy`，这样它们会真正等到 `db` 探测通过才启动，不是等容器"启动"就算数。
- **verify 时的关键信号**：`docker ps -a` 里 `data-service` 的退出码，`0` 是正常（脚本跑完退出），`1` 是报错——它不是常驻服务，"退出"本身不代表出问题，退出码才是判断标准。

### `.env` vs `.env.production`（Vite 环境变量）
- Vite 支持按"模式"加载不同的 env 文件：`.env` 平时开发用（`npm run dev`），`.env.production` 只在 `npm run build`（生产构建）时生效，两者互不干扰。
- `web-client/src/api/*.ts` 里统一用 `import.meta.env.VITE_API_BASE_URL`，代码本身不写死任何地址，只是"读一个变量"——这才让"同一份代码，开发指向 localhost，生产指向线上"这件事成立。
- **`.env` 要 `.gitignore`（含密钥），`.env.production` 不用**——区分标准不是"是不是配置文件"，是"里面有没有机密"。`.env.production` 只有一个公网地址，本来就是给所有访问者用的，不是秘密。

### S3 + CloudFront（前端静态托管）
- **为什么不直接把 S3 设成公开的静态网站**：现在的做法是桶保持**完全私有**（Block Public Access 全部勾选），只允许 CloudFront 通过 **OAC（Origin Access Control）** 读取。好处：真正对外暴露的入口只有 CloudFront 一个，S3 桶本身即使 URL 泄露也访问不了，攻击面更小。
- **上传层级踩过的坑**：第一次用"Add folder"选中整个 `dist` 文件夹上传，S3 把 `dist` 这层文件夹名也保留成了路径前缀（文件变成 `桶名/dist/index.html`），导致 CloudFront 去桶根目录找 `index.html` 会 404。**正确做法**：打开 `dist` 文件夹**进到里面**，选中里面的内容上传，让文件落在桶的根目录。
- **Default root object**：CloudFront 不会自己猜"访问根路径 `/` 该返回哪个文件"，必须显式设成 `index.html`。
- **Error pages（SPA 路由兜底）**：项目用了 `react-router-dom`（客户端路由）。用户直接访问/刷新一个子路径时，S3 上并没有这个文件，会返回 403（不是 404，因为桶是私有的，没权限和没文件在 S3 语义里都是 403）。配置自定义错误响应，把 403/404 都改写成返回 `/index.html`（状态码强制 200），交给前端 React Router 自己识别 URL 渲染正确内容。
- **CloudFront 缓存 + Invalidation**：每次更新 S3 内容后，CloudFront 边缘节点可能还缓存着旧文件，浏览器不会自动看到新版本。要手动创建一次 **invalidation**（清缓存），告诉 CloudFront "别用缓存了，重新去 S3 拉"。**这是一次性动作，不是设置一次永久生效**，以后每次更新前端都要重新做一遍。免费额度是每月 1000 次路径，个人项目用不完。

### 为什么 API 也要套一层 CloudFront（Mixed Content 问题，今晚踩的最大的坑）
- **现象**：前端页面能打开，但所有数据请求都失败，浏览器控制台报 `Mixed Content: ... was loaded over HTTPS, but requested an insecure resource 'http://...'. This request has been blocked.`
- **原因**：浏览器有个安全规则——**HTTPS 页面不允许主动请求 HTTP 资源**（active mixed content），会直接拦截，不给应用层任何机会处理，跟 CORS 是完全不同的两回事，不能用配 CORS 的思路去解决。
- **前端走 HTTPS 是 CloudFront 强制的**（Viewer protocol policy: Redirect HTTP to HTTPS），但 API 只跑在 EC2 裸 IP 的 8080 端口，没有证书，只能是 HTTP。
- **解法**：不用自己搞域名+证书（比如 Let's Encrypt），而是复用刚学的 CloudFront，再建一个 distribution，源站指向 EC2，对外给一个 `https://` 的 `*.cloudfront.net` 地址，CloudFront 负责"浏览器到 CloudFront"这一段的 HTTPS，"CloudFront 到 EC2"这一段继续走 HTTP（这一段在 AWS 内部网络，不经过公网明文暴露给第三方，可接受）。
- **API 这个 distribution 和前端那个的关键差异**：
  - **Cache policy 选 `CachingDisabled`**（前端选的是 `CachingOptimized`）——API 是动态数据，不能被当成静态文件长期缓存，不然看到的数据会一直是过期的。
  - **Allowed HTTP methods 要选全部**（`GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE`）——CloudFront 默认只转发 GET/HEAD，项目里有个 AI 分析接口是 POST，不选全会被 CloudFront 自己挡掉，跟后端代码没关系。
- **Custom origin 不能填 IP，只能填域名**：CloudFront 的"Other/Custom origin"类型强制要求域名，不接受裸 IP。不用额外买域名——**每台有公网 IP 的 EC2 实例，AWS 自动免费分配一个公网 DNS 域名**（格式 `ec2-<IP用短横线连接>.<region>.compute.amazonaws.com`），本来就解析到同一个 IP，直接拿来当 Origin domain 用。

### CORS（跨域资源共享）
- 浏览器默认拦截"网页所在地址"和"请求目标地址"不一致的请求（协议、域名、端口三者只要有一个不同就算跨域）。`api-service/Program.cs` 里用 `AddCors` + `UseCors` 显式声明"允许哪些来源访问我"（`WithOrigins(...)`）。
- **只要换了前端的访问地址（比如以后换自定义域名），CORS 白名单必须跟着更新**，不然即使 HTTPS/网络层都通了，浏览器依然会在应用层拦截，报 CORS 错误。跟 Mixed Content 是两个独立的关卡，都得过。

### 安全组（Security Group）
- 只放行真正需要的端口，按最小权限原则：`22`（SSH）限制到自己的固定 IP（`222.155.28.8/32`），`8080`（API）对 `0.0.0.0/0` 开放（因为 CloudFront 要能连进来，且这本来就是给公众访问的 API）。
- AWS 给每个 VPC 自动建一个叫 `default` 的安全组，跟实例实际用的自定义安全组是两个独立资源，删不掉（AWS 保护），也不需要删——默认规则只允许"同一安全组内部资源互访"，不对外网开任何端口，留着不影响什么。

### `.gitignore` 差点漏掉的东西
- 部署过程中在项目目录里生成了 `nz-market-insights-keys.pem`（SSH 私钥），一开始没被 `.gitignore` 忽略（状态是"未跟踪"，不是"被过滤"），差点在某次 `git add .` 时被误提交到 GitHub——私钥一旦公开，任何人都能拿它登录服务器。补了 `*.pem` 规则到 `.gitignore`，并确认了历史提交里从未出现过（`git log --all -- 文件名` 查得到）。
- **判断一个文件该不该 `.gitignore` 的标准是"泄露后果"，不是"是不是配置文件"**：`.env` 有密码/API key，必须忽略；`.env.production` 只有公网地址，可以提交；`.pem` 是私钥，必须忽略。

## 完整部署流程（以后更新时照着走）

### 后端代码改动（Python / C#）
```bash
# 本地
git add <改动的文件>
git commit -m "..."
git push

# SSH 进服务器
git pull
docker compose up -d --build   # 只有代码变了的服务会被重新 build，其他不受影响
docker ps -a                    # 确认状态：常驻服务是 Up，一次性脚本(data-service)退出码是 0
```

### 前端代码改动（React）
```bash
# 本地，web-client 目录下
npm run build                   # 生成新的 dist/

# 去 S3 控制台：
# 1. 全选桶里现有内容，Delete
# 2. 打开本地 dist 文件夹，进到里面，全选内容拖进 Upload（不要连 dist 这层文件夹一起传）

# 去 CloudFront 控制台（前端那个 distribution）：
# Invalidations → Create invalidation → Object paths 填 /*
```

## 费用相关
- **主动避开的费用项**：CloudFront 的 WAF（Web Application Firewall）——估算 $14/月起，个人项目没必要，两个 distribution 创建时都选了 "Do not enable security protections"。
- **S3 + CloudFront 实际花费**：静态文件总共 1.5MB，流量/请求量远低于免费额度（CloudFront 每月约 1TB 流量、千万级请求免费），预期是 $0。
- **CloudFront Price class**：保留了 "Use all edge locations"（没有为了省小钱切到北美+欧洲），因为目标访问者（NZ 招聘方）在大洋洲，切换会牺牲他们的访问速度，而费用差异在当前流量下可以忽略。
- **还没检查的费用点**：EC2 实例本身是不是 Free Tier 规格（`t2.micro`/`t3.micro`），ROADMAP.md 里提醒过要设置账单告警（Billing Alarm），目前还没配。

## 待办 / 下一步（对应 ROADMAP Phase 6 剩余项）
- **定时刷新数据 ✅ 已完成**：EC2 上用 `crontab -e` 配置了 cron，每 3 天凌晨 3 点（UTC）自动跑一次 `docker compose run --rm data-service`，输出追加记录到 `~/data-refresh.log`。命令细节和 cron 语法解释见 [LINUX_NOTES.md](LINUX_NOTES.md)。
- **换成自定义域名**：现在两个 CloudFront 都用的是 `*.cloudfront.net` 默认域名，计划换成自己的域名——需要在 **us-east-1（N. Virginia）** 区域用 ACM 申请证书（CloudFront 只认这个区域签发的证书，跟其他资源建在哪个区域无关）、在 distribution 里加 Alternate domain name、去域名的 DNS 服务商加一条指向 CloudFront 域名的记录，换完后别忘了同步更新 `Program.cs` 的 CORS 白名单。
- **RDS 迁移**：Postgres 目前还是 docker-compose 里的容器化实例，没迁到 AWS RDS——不影响"有公网链接"这个达成标志，是否要做属于"多学一个 AWS 服务" vs "额外费用/配置成本"的取舍，暂缓。
- **利率/汇率趋势图**：`bank_rates`/`fx_rates` 数据库层面已经是追加式存储（在积累历史），但前端和 API 都还没有对应的历史查询接口和 Trend 图表组件（房价/可负担性已经有了同类组件可以参考）。