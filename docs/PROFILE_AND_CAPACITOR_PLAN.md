# E-Closet：Web Profile 与 Capacitor iOS 开发规划

更新时间：2026-11-11

状态：规划，尚未实施。本文中的新目录、接口、配置和命令用于后续开发，不代表仓库已具备相应功能。

## 已确认的方向

- 衣物、搭配、衣橱图片只保存在用户本地，不建设衣橱云端数据库、图片云存储或自动同步。
- 继续使用 Next.js、React、TypeScript 和 CSS Modules，尽量复用现有页面组件与搭配逻辑，不迁移到 Vite。
- 第一阶段先让 Web 端 Profile、手机号注册登录和本地数据隔离正常运行。
- 后端 API 继续部署在 Vercel；账户和最小个人资料保存在持久化的云端认证服务／数据库中。
- 后续用 Capacitor 打包 iOS；Web 继续使用 IndexedDB，iOS 正式版采用 SQLite 与应用私有文件目录。
- 同时考虑中国大陆和海外用户，手机号必须包含国家区号；两地验证码与网络体验都需要验收。

这里的“手机号绑定”表示：一个已验证的手机号在同一账户系统中同一时间绑定一个账户。衣橱记录绑定稳定的 `user_id`，不直接绑定电话号码。重新登录能找到同一账户，但不能恢复已经从设备删除的衣橱。

本文规划新增能力；[TECH_STACK.md](./TECH_STACK.md) 和 [UXDESIGN.md](./UXDESIGN.md) 中的 MVP 描述仍用于说明已有实现。

## 现有代码基线

| 位置 | 当前职责 | 与本次规划的关系 |
| --- | --- | --- |
| `src/app/` | Next.js App Router 页面 | 新增 Profile、登录及账户 API |
| `src/components/BottomNavigation.tsx` | 四个底部入口 | 已链接 `/profile`，目前缺少页面 |
| `src/components/FigmaCloset.tsx` | 衣橱列表 | 当前直接查询全局 Dexie 表 |
| `src/components/FigmaItemDetail.tsx` | 添加／编辑衣物、上传抠图 | 增加数据归属和统一 API 调用 |
| `src/components/FigmaOutfitDetail.tsx` | 搭配画布及保存 | 增加数据归属，保留画布行为 |
| `src/components/FigmaSavedOutfits.tsx` | 已保存搭配 | 查询当前用户本地分区 |
| `src/lib/db.ts` | Dexie v1：`clothingItems`、`outfits` | 升级本地 schema，增加用户隔离 |
| `src/lib/types.ts` | 衣物、搭配、图片 Blob 类型 | 增加 owner 与平台存储边界 |
| `src/app/api/remove-background/route.ts` | remove.bg 代理 | 继续使用，增加适用的认证／配额保护 |
| `src/app/api/weather/route.ts` | Open-Meteo 代理 | 继续使用，接入 API 地址封装 |
| `src/app/items/[id]/page.tsx` | 运行时衣物详情路由 | iOS 静态包需要替代入口 |
| `src/app/outfits/[id]/page.tsx` | 运行时搭配详情路由 | iOS 静态包需要替代入口 |
| `src/app/page.tsx` | 服务端重定向到衣橱 | iOS 入口改用静态页面与客户端导航 |

当前安装的 Next.js 为 `16.3.5`；`package.json` 中部分依赖使用 `latest`，仓库已有 `package-lock.json`。正式接入认证和 Capacitor 时固定经过验证的版本，Windows、Mac、CI 与 Vercel 使用一致的 Node 主版本和锁文件。

---

## 1. Web 端 Profile：范围、数据与验收

### 1.1 第一阶段的产品范围

| 功能 | 第一阶段行为 |
| --- | --- |
| Profile 页面 | 游客看到注册／登录入口；已登录用户看到昵称、预设头像、脱敏手机号与本地数据说明 |
| 注册与登录 | 国家区号 + 手机号 + 短信验证码；首次验证完成后完成注册，已有账户进入登录流程 |
| 个人资料 | 昵称可选；头像先选择内置图案，云端只保存 `avatar_key` |
| 修改手机号 | 重新验证当前账户身份，再验证新号码；更换绑定后 `user_id` 和本地衣橱归属不变 |
| 退出登录 | 撤销当前会话、清空内存中的账户状态，隐藏该账户本地衣橱；不自动删除衣物和图片 |
| 删除账户 | 明确二次确认与重新验证；删除云端账户资料，并清理当前设备该账户的本地衣橱 |
| 本地数据管理 | 显示当前分区衣物／搭配数量；提供手动导出、导入和清空当前分区的入口 |
| 隐私说明 | 说明账户资料保存位置、衣橱仅在本地、抠图会将处理副本发送给第三方 |
| 状态处理 | 加载、未登录、已登录、离线、验证码错误／过期、限流、保存失败都有明确反馈 |

第一阶段继续允许游客使用本地衣橱。账户服务不可用时，已经保存在当前设备的数据仍可读取；首次访问网站的离线加载能力不在本阶段承诺范围内，因为当前项目没有 Service Worker 或 PWA 离线缓存。

自选头像照片、社交主页、关注分享、邮箱／密码登录、衣橱云备份和多设备同步不纳入第一阶段。预设头像避免为 Profile 额外建立图片云存储。

### 1.2 数据保存在哪里

| 数据 | 保存位置 | 说明 |
| --- | --- | --- |
| 账户 UUID、已验证手机号、认证状态 | 云端认证系统 | 手机号标准化为 E.164；由认证系统维护唯一性 |
| 昵称、预设头像标识、资料时间戳 | 云端 `profiles` 表 | 只保存最小账户资料 |
| 衣物名称、类别、颜色、时间戳 | Web IndexedDB | 不上传到账户数据库 |
| 搭配名称、衣物引用、位置与图层 | Web IndexedDB | 不上传到账户数据库 |
| 原图、抠图结果、本地导入的头像照片（若未来支持） | 本地存储 | 衣橱图片不建设云端副本 |
| Profile 脱敏缓存、设备偏好 | 本地存储 | 缓存不是认证凭证 |
| 登录会话 | Web 安全 Cookie；后续 iOS Keychain | 与衣橱数据库分开 |
| 用户主动导出的衣橱文件 | 用户选择的下载位置 | 文件可以包含个人照片，由用户自行保管 |

“衣橱只存本地”不等于“图片绝不离开设备”。现有抠图功能仍会通过 Vercel 临时处理上传副本，并发送给 remove.bg。应用不主动持久化这些图片到服务端；第三方的处理与保留规则需要在隐私说明中准确披露，日志中也不记录图片内容。天气请求仍发送经过取整的坐标。

### 1.3 云端账户模型

建议 Web 首版评估 Supabase Auth + PostgreSQL：认证服务管理身份，应用维护最小 Profile。所有业务访问通过 Vercel API，客户端不依赖供应商数据库表结构。

```text
认证系统管理的用户
  id: UUID，永久账户标识
  phone: 已验证的 E.164 手机号，唯一绑定
  phone_verified_at: 验证时间
  created_at: 创建时间

profiles
  user_id: UUID，主键，关联认证用户
  display_name: 可空字符串，建议限制为 40 个字符
  avatar_key: 内置头像枚举
  created_at: 服务端时间
  updated_at: 服务端时间
```

手机号只在认证系统保留权威副本，Profile 页面通过账户 API 获得脱敏展示值。使用服务端权限写 Profile 时，必须从验证后的会话取得 `user_id`；用户不能通过请求体指定其他人的账户。若启用供应商的数据 API，仍为表配置仅允许本人访问的权限策略。

认证服务可能在发送验证码时预建未验证记录；只有验证完成后才视为产品意义上的注册成功，并幂等创建 Profile。短信发送成功不代表注册完成。

Supabase 支持手机号 OTP，并需要配置短信发送服务。可通过 Send SMS Hook 接入自定义发送逻辑；若采用该方案，由认证服务负责验证码的签发／校验，Hook 负责验签和发送，不能只接一个短信 SDK 就视为完成认证。[手机号认证](https://supabase.com/docs/guides/auth/phone-login)、[Send SMS Hook](https://supabase.com/docs/guides/auth/auth-hooks/send-sms-hook)

供应商尚未最终确定。开发开始前先验证 `+86` 与至少一个海外区号的真实发送、验证、刷新会话和换号流程；需要供应商项目、短信资质／模板及测试号码。生产验收不能用仅在前端保存的假登录状态代替。

### 1.4 本地数据归属与旧数据迁移

为衣物和搭配增加 `ownerId`：

```ts
type LocalOwnerId = `guest:${string}` | `user:${string}`;

// 衣物、搭配保留现有字段，并新增：
type LocalOwnership = {
  ownerId: LocalOwnerId;
};
```

具体规则：

1. 首次使用生成并持久化一个游客 UUID，不使用手机号或设备指纹作为游客身份。
2. Dexie 从 v1 升级到 v2。升级事务为旧记录写入同一个游客 owner，保留原来的衣物 ID、搭配引用和图片 Blob，不能清库重建。
3. 第一版可以用轻量设置表保存游客 owner、最后使用的分区及脱敏 Profile 缓存；会话凭证不放进这张表。
4. 首次登录时，若游客分区有数据，明确提供“导入到当前账户”与“保留游客衣橱”两个选择，不自动认领。
5. 用户选择导入后，在一个事务中修改衣物与搭配 owner；失败回滚，不删除来源数据。
6. 每次列表、按 ID 读取、编辑、删除和级联清理都验证 owner。搭配只能引用同一 owner 的衣物。
7. 退出后回到游客分区。登录 B 账户不能显示 A 账户的衣橱；也不自动把 A 的数据移动到游客区。
8. 登录状态初始化完成前显示加载状态，不能先查询全表再过滤，避免短暂展示其他分区。

本地索引建议保留 `&id` 并新增 `[ownerId+createdAt]`、`[ownerId+updatedAt]` 等实际需要的组合索引。所有现有直接 `db.*` 访问都要审查，包括 `deleteClothingItemCascade()` 的全量搭配读取。

这属于应用层数据隔离，不是本地加密：同一浏览器／系统账户下拥有开发者工具或文件访问权限的人仍可能读取数据。离线模式可以继续使用此前已解锁的本地分区；退出登录必须锁定该分区。离线读取不能被当作云端会话仍有效的证明。

### 1.5 建议 API 与会话契约

以下路径为计划新增，现有天气与抠图路径保留。

| 方法与路径 | 用途 | 关键约束 |
| --- | --- | --- |
| `POST /api/auth/otp/request` | 请求登录／注册验证码 | 标准化手机号；统一响应，避免泄露号码是否注册；持久化限流 |
| `POST /api/auth/otp/verify` | 验证并登录 | 成功后创建／读取 Profile；错误或过期验证码不能建立会话 |
| `POST /api/auth/session/refresh` | 刷新会话 | 使用认证系统的刷新与撤销机制；Web 与 App 响应分别适配 |
| `POST /api/auth/logout` | 退出当前会话 | 撤销相应会话；清除 Cookie 或 App 凭证 |
| `GET /api/me` | 获取账户与 Profile | `Cache-Control: no-store`；不接受客户端指定 owner |
| `PATCH /api/me` | 更新昵称和预设头像 | 服务端校验长度、枚举和当前账户身份 |
| `POST /api/me/phone/request` | 请求换号 | 当前账户近期重新验证；新手机号不得属于其他账户 |
| `POST /api/me/phone/verify` | 完成新号码验证 | 使用供应商安全换号流程；不能直接修改 Profile 字段完成换绑 |
| `DELETE /api/me` | 删除账户 | 近期身份验证；服务端撤销会话并删除账户与资料 |

会话方式：

- Web 首阶段采用同源 BFF，由服务端维护 `HttpOnly`、`Secure`、适当 `SameSite` 的会话 Cookie；具体属性按开发／生产环境处理。修改类请求检查来源并实现适用的 CSRF 保护。
- 后续 App 使用访问令牌和刷新令牌；刷新令牌交给经审查的 Keychain 适配层，访问令牌尽量只在内存中持有。不能把长期令牌放入衣橱数据库或普通 Preferences。
- 服务端统一实现 `requireCurrentUser()`，分别解析 Web Cookie 与 App Bearer 凭证；App 登录／刷新可使用明确独立的接口，不能向 Web JS 返回长期令牌。
- 短信限流按手机号、IP 和项目总量设置，计数保存在认证服务或持久化限流存储中，不依赖 Vercel 函数进程内变量。
- 删除、禁用账户后，服务端必须拒绝相应请求；不能只验证 JWT 签名却忽略账户状态。临时断网与真实注销／账户删除要区分处理，网络错误不能触发本地清库。

丢失旧手机号的账户恢复不通过“改本地手机号”解决。首版只提供已登录且完成身份验证的安全换号；丢失全部凭证的恢复机制需要另行设计，不能声称短信绑定等于永久识别同一个人。

### 1.6 导出、导入与删除策略

本地保存的代价是：清除网站数据、卸载 App 或丢失设备后，没有云端衣橱可恢复。Profile 必须清楚展示这个事实，并提供用户主动操作的数据导出。

建议导出为归档文件，包含版本化 `manifest.json`、衣物／搭配数据和原图／处理图。不能把 Blob 直接交给 `JSON.stringify()`；会话令牌、验证码、服务端密钥不进入导出文件。

导入先验证版本、归档路径、文件类型、总大小与搭配引用，再预览数量并由用户确认目标分区。ID 冲突时重映射衣物 ID 和所有搭配引用；不要直接按归档里的 owner 覆盖当前账户。Web 导出文件是未来迁移到 iOS 的正式入口，网站与 App 不能共享同一个 IndexedDB。

“清空本机衣橱”和“删除账户”是两个不同操作：前者不删除云端账户；后者删除云端身份与资料，并清理当前设备相应分区。账户删除期间隐藏该分区，记录本机待清理状态，重开后继续完成失败的本地清理。用户另存的归档、其他离线设备的数据无法由服务端远程擦除，需要明确告知；其他设备联网确认账户已删除后再按流程清理，不根据普通网络失败推断删除。

### 1.7 Web 代码改动清单

| 文件／目录 | 计划修改 |
| --- | --- |
| `src/app/profile/page.tsx` | 新增 Profile 页面入口，使用现有页面容器和底部导航 |
| `src/app/login/page.tsx` | 新增手机号与验证码界面，登录后返回受校验的站内地址 |
| `src/components/Profile*.tsx` | 展示／编辑资料、数据管理、退出与删除确认 |
| `src/lib/auth/` | 认证供应商适配、服务端会话、用户校验；服务端模块防止客户端导入 |
| `src/lib/api-client.ts` | 封装 API 地址、错误格式、凭证和请求超时 |
| `src/lib/storage/` | 添加 owner 作用域访问及导入导出；为后续原生适配保留接口 |
| `src/hooks/` | 添加会话状态与 owner 感知的数据 hooks |
| `src/lib/db.ts`、`types.ts` | Dexie v2、owner、设置／缓存类型与升级事务 |
| 四个衣橱／搭配主体组件 | 所有读写接入当前 owner，保留已有表单与画布行为 |
| `src/app/api/auth/`、`src/app/api/me/` | 实现账户接口；输入校验、认证、限流、无敏感日志 |
| `.env.example`、`README.md` | 补充配置项、运行方式和本地数据说明；示例不含真实凭证 |

Web 阶段继续使用 `useLiveQuery`。先把查询封装为 `useClothingItems()`、`useOutfits()` 等业务 hooks，后续原生版本替换内部实现，避免 UI 长期依赖 Dexie 的具体查询链。

### 1.8 Web 完成标准

- [ ] 注册、已有账户登录、验证码重试／过期／限流，在开发环境及 Vercel 上均正常。
- [ ] 生产目标包含大陆与海外时，两地真实号码均完成端到端验证码测试。
- [ ] 昵称和预设头像保存后刷新页面、重新登录仍存在；电话号码脱敏展示。
- [ ] 修改号码后保留 `user_id` 和本地衣橱，已占用号码不能换绑。
- [ ] Dexie v1 数据升级后原图、抠图、搭配布局均完整；迁移失败不会清空旧数据。
- [ ] 游客认领、A／B 切换、按 ID 访问和级联删除都不跨 owner。
- [ ] Profile 加载／账户服务断网不会阻塞已加载页面中的本地衣橱读写。
- [ ] 导出再导入能恢复图片和搭配引用；错误归档不会破坏已有数据。
- [ ] 退出保留数据并隐藏原分区；删号完成当前分区清理及云端资料删除。
- [ ] `npx tsc --noEmit`、`npm run lint`、`npm run build` 通过，验证生产构建而不只验证 `next dev`。

---

## 2. 后续技术栈与部署结构

### 2.1 保留 Next.js，分别构建 Web 与手机包

后续使用同一个仓库、共享界面与业务模块、两个轻量 Next.js 入口。当前根目录 Next.js 应用在进入移动阶段时迁至 `apps/web`；移动入口只组装静态可导出的页面，不复制整套业务组件。

```text
repo/
├─ apps/
│  ├─ web/                       Next.js 常规构建，部署 Vercel
│  │  └─ src/app/api/            账户、天气、抠图 API 只在这里
│  └─ mobile/                    Next.js 静态导出 + Capacitor
│     ├─ src/app/                静态页面入口，不包含账户 API
│     ├─ next.config.ts          output: 'export'
│     ├─ capacitor.config.ts     webDir: 'out'
│     ├─ public/                 构建前同步共享的公开素材
│     └─ ios/                    原生工程，纳入版本控制
├─ packages/
│  ├─ client/                    现有 UI、CSS、业务 hooks 和画布逻辑
│  ├─ domain/                    共享数据模型、校验和路由辅助函数
│  ├─ storage/                   Web Dexie / iOS SQLite + Filesystem
│  └─ assets/                    共享公开图片素材来源
└─ package.json                 npm workspaces；统一 lockfile
```

这项目录调整发生在 Web Profile 验收之后。现在不为写 Profile 提前搬迁整个仓库，也不需要单独建立第二个后端或部署移动前端网站。

运行关系：

```text
Web 浏览器
  ├─ Next.js 页面与同源 API ── Vercel ── 账户认证服务／Profile 数据库
  └─ Dexie / IndexedDB：当前浏览器的衣物、搭配和图片

iPhone App
  ├─ 安装包内 Next.js 静态资源，由 Capacitor WKWebView 加载
  ├─ HTTPS 调用同一 Vercel API ── 账户认证服务／Profile 数据库
  └─ SQLite：衣物／搭配元数据；Filesystem：图片；Keychain：凭证
```

Vercel API 不负责保存衣橱。图片处理请求是临时传输，不转变为云端图片管理服务。

### 2.2 各阶段技术选择

| 领域 | Web Profile 阶段 | iOS 正式版本 |
| --- | --- | --- |
| 框架 | Next.js App Router + React + TypeScript | 同样保留 Next.js，使用独立静态构建入口 |
| 样式与搭配 | CSS Modules、现有素材、`react-rnd` | 复用，补充触摸、键盘、安全区域适配 |
| 衣橱元数据 | Dexie / IndexedDB | 经过插件验证的 SQLite 适配 |
| 图片 | IndexedDB Blob | 应用私有持久化目录；数据库只保存相对路径及元数据 |
| 账户 | 云端手机号认证 + 最小 Profile 数据库 | 同一账户系统及稳定 UUID |
| 凭证 | 同源服务端会话 Cookie | Keychain + 内存访问令牌 |
| 拍照与选图 | 浏览器文件输入 | Capacitor Camera／照片选择，保留 Web 后备实现 |
| 天气定位 | 浏览器 Geolocation | 原生 Geolocation 适配，拒绝权限时继续使用衣橱 |
| API 部署 | Vercel Next.js Runtime | 继续调用同一 Vercel 部署 |

Capacitor 官方指出 iOS WebView 的 IndexedDB 可能被系统回收，大量本地数据适合 SQLite；因此 IndexedDB 可以用于早期打包验证，但不作为正式 iOS 版衣橱的唯一持久存储。[存储指南](https://capacitorjs.com/docs/guides/storage)

### 2.3 大陆与海外的边界

先保留 Vercel 的决定，但将 API 基地址、认证适配和短信发送实现集中管理。大陆访问 Vercel 可能出现延迟或不可达，注册、换号、天气和抠图都应分别实测，不能以海外测试代替。[Vercel 大陆访问说明](https://vercel.com/kb/guide/accessing-vercel-hosted-sites-from-mainland-china)

本地衣橱在原生 App 中不依赖这些服务才能打开；网络质量主要影响账户操作和联网功能。若实测不达标，再评估国内 API／认证部署，作为后续部署决策，不在本阶段自动扩展成两套区域后端。国内／海外数据保存位置也须在正式选择服务商时一并确定。

---

## 3. 技术调整步骤：代码、Vercel 与 Mac

### 3.1 阶段 A：完成 Web Profile

1. 按第 1 节确定认证项目与两地短信方案，固定依赖版本和 Node 主版本。
2. 创建 Profile 数据表、权限策略及认证适配层，完成真实注册登录闭环。
3. 实施 Dexie v2 升级、游客 owner 和当前用户分区，修改现有全部衣橱读写。
4. 新增 Profile／登录页面、资料编辑、安全换号、退出、删号、导入导出。
5. 完成构建检查与有意义的行为验证，重点覆盖数据迁移、归属隔离及损坏导入文件。
6. 在 Vercel Preview 验收，再验证 Production；两种部署的数据与短信测试配置分开。

这一阶段不启用 `output: 'export'`，不安装 SQLite 或生成 iOS 工程。

### 3.2 阶段 B：准备 Next.js 静态客户端

当前动态详情路由的 ID 在用户使用过程中才产生，不能用构建时生成所有 ID 的方式解决。Next.js 静态导出也不能包含需要请求数据的账户／抠图／天气 Route Handlers。[静态导出限制](https://nextjs.org/docs/app/guides/static-exports)

需要实施以下修改：

| 当前实现 | 计划调整 | 保留的代码 |
| --- | --- | --- |
| `/items/[id]` | 手机入口使用 `/items/edit/?id=...` | 继续调用 `FigmaItemDetail`，传入 `itemId` |
| `/outfits/[id]` | 手机入口使用 `/outfits/edit/?id=...` | 继续调用 `FigmaOutfitDetail`，传入 `outfitId` |
| 页面散落的详情链接 | 统一 `routes.item(id)`、`routes.outfit(id)` | 继续使用 `next/link` 和 `next/navigation` |
| 根页面 `redirect('/closet')` | 手机入口渲染静态页面，挂载后客户端 `router.replace()` | Web 入口可继续服务端跳转 |
| 直接 `fetch('/api/...')` | 统一 API 客户端；Web 使用同源，App 使用明确的 HTTPS 基地址 | 原有天气／抠图响应与 UI 状态 |
| UI 直接调用 Dexie | 通过 owner 感知的 repository 与业务 hooks | 原有页面业务流程与布局 |
| 图片始终为 Blob | 存储层返回显示资源，适配 Blob 或原生文件 URI | 图片组件和画布交互 |

移动详情页由客户端 `useSearchParams()` 读取 ID，并置于 `<Suspense>` 内；不要依赖服务端 Page 的请求期 `searchParams`、Cookie 或 Server Actions。缺少 ID、ID 不存在或 owner 不符时显示错误并提供返回入口。[useSearchParams](https://nextjs.org/docs/app/api-reference/functions/use-search-params)

共享链接可统一采用 query 形式，让 Web 同时新增对应静态入口；旧 `[id]` 路由仅保留在 Web 作为兼容入口。不能把旧动态路由文件留在移动入口里，再指望 `generateStaticParams()` 返回空数组支持后续任意用户数据。

完成前述调整后才拆分 workspaces。Web 与 mobile 使用一致的 Next／React 版本；共享 TS／CSS 模块配置 `transpilePackages` 等所需构建选项。公开素材以一个来源为准，由可重复的准备脚本复制到各入口的 `public/`，同时验证字体和 `/_next/` 资源能从安装包本地加载。

移动入口 `next.config.ts` 的配置方向：

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  // 若后续使用 next/image，静态包关闭默认服务端图片优化。
  images: { unoptimized: true },
  // 共享包建立并命名后，再加入实际的 transpilePackages 配置。
};

export default nextConfig;
```

Web 的 `next.config.ts` 继续常规构建。不能只给当前项目加一个 `MOBILE_BUILD` 开关，然后原样导出仍包含 `src/app/api` 的路由树；两个入口应从文件结构上明确分开。

### 3.3 阶段 C：原生本地存储与图片管理

1. 选定并验证支持所用 Capacitor 版本及原生依赖管理器的 SQLite 插件、Keychain 适配和文件操作方案，再固定版本。
2. 给数据层实现 Web／native 两种 adapter：列表、读取、保存、删除、事务与变更通知保持统一接口；Web 内部继续使用 Dexie。
3. iOS 使用 SQLite 存元数据与 owner；图片写入应用私有持久化目录，避免把唯一原图放在可清理的 Cache 目录。保存相对文件标识，不保存容易变化的沙盒绝对路径。
4. 数据库和文件系统不是一个事务：先写临时文件，确认文件可用后提交元数据，再清理旧文件；失败清理临时文件，并设计重启后的孤立文件检查。
5. 删除衣物先处理相同 owner 的搭配引用，再按引用情况清理图片；所有文件操作限制在本应用分区内。
6. Web 与 App 的本地空间独立，通过第 1.6 节归档完成用户主动迁移；同一手机号登录不会触发自动导入。
7. 原生拍照／照片可能返回 HEIC 等格式；进入现有 WebP 抠图流程前做实际支持验证或转换。检查方向、透明通道、内存用量、文件大小和重试。
8. 对 iOS 文件备份策略作明确选择：建议唯一原图和数据库允许系统设备备份，可再生成的缩略图排除。系统备份属于用户设备设置行为，不等于应用提供云端恢复；隐私说明需避免宣称数据绝不会进入系统备份。

抠图保持现有小文件代理，不引入云端图片桶。现有入口接受最大 10 MB 原文件，但 API 只接受准备后约 4 MiB 的图片；客户端缩放到 2000 px 并不能保证文件一定足够小，应补充体积检查与进一步压缩／提示。Vercel Function 请求体上限为 4.5 MB，multipart 开销也需要预留。[Vercel 限制](https://vercel.com/docs/functions/limitations)

### 3.4 Vercel 设置：先 Web，后共享 API

#### Web Profile 阶段

| 设置 | 计划值／操作 |
| --- | --- |
| Framework Preset | Next.js |
| Root Directory | 当前仓库根目录 `.` |
| Build Command | `npm run build`，保持常规 `next build` |
| Output Directory | 保持 Next.js 自动识别，不改成 `out` |
| Node.js Version | 与本地验证后的版本一致；建议统一 Node 24.x |
| Production Domain | 尽早固定正式域名，作为 Web 本地数据 origin |
| Function Region | 按账户数据库位置选择，并在大陆／海外实测 |
| Preview | 使用测试账户服务／短信配置；避免误发真实短信、连接生产资料库 |

为避免 Vercel 默认版本随平台更新而变化，后续在 `package.json` 明确声明 `engines.node: "24.x"`，并与控制台设置对齐。Vercel 按主版本选择运行时，补丁版本由平台维护，不承诺与本地补丁号完全相同。[Node.js 版本设置](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)

部署域名变化会改变 IndexedDB origin；从 `xxx.vercel.app` 切到自定义域名不会自动搬迁衣橱。上线前提供从旧域名导出、到新域名导入的路径。

建议配置清单如下，变量名为应用规划，需与最后实现一致：

| 变量 | 放在哪里 | 用途 |
| --- | --- | --- |
| `REMOVE_BG_API_KEY` | Vercel 服务端、本地 `.env.local` | 已有抠图密钥 |
| `AUTH_PROVIDER_URL` | 服务端环境 | 认证服务地址 |
| `AUTH_PROVIDER_PUBLISHABLE_KEY` | 服务端环境 | BFF 调用认证服务的公开级标识 |
| `AUTH_PROVIDER_SECRET_KEY` | 仅服务端环境 | 经过权限审查的账户管理／删号操作 |
| `DATABASE_URL` | 仅当 API 直接连数据库时 | 使用适合函数环境的连接池地址；不必与供应商数据 API 重复接入 |
| `SMS_*`、`SMS_HOOK_SECRET` | 仅在应用承担短信 Hook 时 | 服务商凭证、模板和 Hook 验签；也可以由认证平台托管 |
| `ALLOWED_APP_ORIGINS` | Vercel 服务端 | 后续原生 WebView Origin 白名单 |
| `NEXT_PUBLIC_API_BASE_URL` | Web 留空；mobile 构建环境填正式 HTTPS 地址 | Web 相对路径，App 远程 API 地址 |

任何秘密都不加 `NEXT_PUBLIC_` 前缀。公开变量在 `next build` 时写进客户端包；修改 Vercel 环境变量后需要重新部署，修改手机包的 API 地址则需要重新构建并同步原生资源。[Next.js 环境变量](https://nextjs.org/docs/app/guides/environment-variables)、[Vercel 环境变量](https://vercel.com/docs/environment-variables)

Vercel 保存环境变量不等于已经建立数据库：还要在供应商侧创建项目、执行版本化数据库迁移、配置短信发送及权限。数据库迁移作为明确的发布步骤执行，不在每次 API 请求中自动建表。

#### 接入 mobile workspace 之后

- 将同一个 Vercel 项目的 Root Directory 调整为 `apps/web`，保留正式域名；其包内 `build` 脚本仍执行 `next build`。
- 根仓库维护 npm workspaces 和唯一锁文件；让 Vercel 从 workspace 根解析依赖，验证共享包也参与构建。优先沿用自动安装检测，若覆盖安装命令则明确从仓库根执行 `npm ci`，不要在子目录生成第二份锁文件。
- `apps/mobile/out` 只用于手机安装包，不作为 Vercel 后端 Output Directory。Web 的 API 与页面仍由 Next.js Runtime 提供。
- 给需要原生调用的接口实现 `OPTIONS` 和 CORS，包括成功与失败响应。按实际配置校验 Origin，允许 `Authorization`、`Content-Type` 及所需方法；动态 Origin 响应设置 `Vary: Origin`。
- iOS 默认常见 Origin 为 `capacitor://localhost`，但以真机请求观察和 Capacitor 配置为准；Web 生产同源请求不因携带正式 Origin 而被错误拒绝。开发 localhost 单独配置，不把所有 Preview 域名默认放行。
- App 使用 Bearer 方式，避免依赖跨站 Cookie；CORS 白名单只是浏览器边界，不能代替认证。受保护接口即使没有 Origin 也必须验证凭证。
- 检查 Vercel Deployment Protection：测试部署要让测试 App 实际可访问；不要把保护绕过密钥嵌入安装包。
- 函数日志只记录脱敏错误和请求标识，不记录完整手机号、OTP、令牌、图片或定位坐标。

[Vercel Monorepo 文档](https://vercel.com/docs/monorepos)

### 3.5 Mac 环境搭建

以下是后续在 Mac 上执行的步骤，本次没有运行或安装这些工具。官方当前 Capacitor 8 文档要求 Node.js 22+、macOS 与 Xcode 26.0+；建议项目统一 Node 24.x，并在实际接入日重新核对插件、Xcode 和 macOS 兼容性。[环境要求](https://capacitorjs.com/docs/getting-started/environment-setup)

#### 第一步：准备基础工具

1. 安装支持目标 Xcode 版本的 macOS，再安装完整 Xcode；打开 Xcode 完成首次初始化、许可确认和 iOS Simulator Runtime 下载。
2. 配置命令行工具指向完整 Xcode；仅安装 Command Line Tools 不能完成 iOS App 构建。
3. 通过 Node 官方安装包或现有版本管理工具安装项目固定的 Node 24.x；安装 Git，克隆仓库。正式签名和分发需要相应的 Apple Developer 账户与团队配置。

```bash
xcode-select --install
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
xcodebuild -version
xcode-select -p
node --version
npm --version
git --version
```

如果 Xcode 安装在其他路径，相应修改 `--switch` 参数。仓库建议新增 `.nvmrc` 或等效版本声明，Mac 与 Vercel 对齐。当前 Windows 已检查到 Node `v24.14.1`、npm `11.11.0`；PowerShell 若阻止 `npm.ps1`，使用 `npm.cmd`／`npx.cmd` 即可，无需为此修改全局脚本执行策略。

#### 第二步：先验证 Web 工程

在克隆后的仓库根目录执行：

```bash
npm ci
npm run lint
npm run build
npm run dev
```

先按实际阶段的 `.env.example` 配置未提交的 `.env.local`。若此时还没有拆分 workspaces，以上使用现有脚本；拆分后在根脚本保留相同的 Web 行为，转发至 `apps/web`。不要从 Windows 复制 `node_modules` 到 Mac。

#### 第三步：建立 mobile workspace 并初始化 Capacitor

该步骤以第 3.2 节的目录拆分已经完成为前提。给 `apps/mobile/package.json` 设置 `name: @ecloset/mobile`，并包含 `build: next build`。共享包接入完成后，从仓库根执行：

```bash
npm install --workspace @ecloset/mobile --save-exact @capacitor/core@8 @capacitor/ios@8
npm install --workspace @ecloset/mobile --save-dev --save-exact @capacitor/cli@8
cd apps/mobile
npx cap init
```

上述 `@8` 用于首次解析兼容的 8.x 版本，`--save-exact` 写入确定版本；核对 core／cli／ios 的版本兼容并提交锁文件，其他开发机之后只执行 `npm ci`。若已安装新的主版本，先复核文档而不是直接沿用这些版本号。

初始化时填写应用名 `E-Closet`、开发者自己控制的 Bundle ID（如 `com.yourcompany.ecloset`，发布前替换为真实值）以及构建目录 `out`。`apps/mobile/capacitor.config.ts` 的目标配置：

```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourcompany.ecloset',
  appName: 'E-Closet',
  webDir: 'out',
};

export default config;
```

生产配置不设置远程 `server.url`，也不开启任意导航或 HTTP 明文访问。官方将 `server.url` 定位为开发热重载用途；手机包应能从本地资源启动。[Capacitor 配置](https://capacitorjs.com/docs/config)

#### 第四步：生成并打开 iOS 工程

仍在 `apps/mobile`：

```bash
# 地址为占位符，先替换为已部署、可访问的正式或测试 API 域名。
export NEXT_PUBLIC_API_BASE_URL=https://api.example.com
npm run build
npx cap add ios
npx cap sync ios
npx cap open ios
```

`npm run build` 应生成包含 `index.html`、页面与 `/_next/` 资源的 `out/`。`cap add ios` 只在该工程首次生成时执行，之后更新代码使用以下流程：

```bash
npm run build
npx cap sync ios
npx cap open ios
```

添加原生插件、修改公开构建变量或更新前端后，都重新构建并同步。原生权限／签名等修改还需要重新编译 App。[安装及同步流程](https://capacitorjs.com/docs/getting-started)、[iOS 运行方式](https://capacitorjs.com/docs/ios)

Capacitor 8 当前默认使用 Swift Package Manager，优先按它验证依赖；若所选 SQLite 等插件只支持 CocoaPods，先安装 Homebrew／CocoaPods，并在首次添加平台时改用 `npx cap add ios --packagemanager CocoaPods`。两种路径选择其一，不对已有工程盲目重复 `cap add`。[原生依赖管理](https://capacitorjs.com/docs/getting-started/environment-setup)

#### 第五步：Xcode、真机与发布准备

1. 在 Xcode 配置 Signing & Capabilities：真实 Bundle Identifier、开发团队、自动签名和目标 iOS 版本；所选插件的最低版本也要满足。
2. 先在模拟器验证页面启动、导航、静态资源和 API；再用 iPhone 验证照片选择、拍照、定位权限、短信登录、SQLite 持久化与文件路径。
3. 真机按系统要求启用 Developer Mode，配置相机、照片和定位用途说明；按使用的系统 API／插件补充 Privacy Manifest，不申请没有实际用途的权限。
4. 原生插件确认后将 `apps/mobile/ios` 中需要维护的工程文件提交；编译产物、签名私钥、证书密码和本地开发配置不入库。
5. 数据迁移必须在 SQLite 真机路径验证。关闭 App、系统终止进程、重启设备和升级安装后，已保存衣橱仍完整。
6. 发布前建立 App Store Connect 记录，准备图标、截图、隐私政策与数据收集声明，经 Xcode Archive 上传 TestFlight，再进行审核发布。

### 3.6 iOS 与上架验收

- [ ] 安装包内不依赖远程网站加载界面；断网冷启动能打开原生本地衣橱。
- [ ] 任意新建衣物／搭配 ID 可从列表进入、刷新页面和重开 App，静态路由不出现 404。
- [ ] Web 与移动生产构建分别通过，Vercel 的账户／抠图／天气 API 未因静态导出失效。
- [ ] API CORS 预检、认证过期、断网、限流、抠图失败均有可恢复的用户状态。
- [ ] 衣物、搭配、照片在 SQLite／Filesystem 中按 owner 隔离，重装不承诺恢复；升级保留原有记录。
- [ ] Web 导出到 iOS 导入完成端到端验证，错误文件与存储不足时不破坏原数据。
- [ ] 注册与删号在 App 内可完成；审核人员可访问有效演示账户或合适的演示模式，不能依赖开发者私人手机接验证码。
- [ ] 隐私政策说明账户、短信、临时抠图处理与本地数据行为，权限说明与真实实现一致。
- [ ] 中国大陆与海外的真实网络／手机号完成测试；大陆区发行所适用的备案资料提前核对。

Apple 对支持创建账户的 App 要求提供 App 内账户删除入口，并要求提交可审核的完整功能；技术上采用 Capacitor 并不代替功能和体验验收。[审核指南](https://developer.apple.com/app-store/review/guidelines/)

大陆区发行的材料要求按产品实际适用情况核对，不能简单由“只存本地”推断无需任何备案。[App Store Connect 应用信息](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information)

## 开发顺序与阶段产物

| 顺序 | 阶段产物 | 进入下一阶段的条件 |
| --- | --- | --- |
| 1 | 可验证的认证供应商与短信方案 | 注册登录、刷新、换号在目标地区可运行 |
| 2 | Web Profile 与 Dexie v2 | 第 1.8 节验收通过，已有衣橱无损 |
| 3 | 手动归档与 owner 数据访问接口 | 本地导入导出、游客认领与账户隔离通过 |
| 4 | Next.js 双入口与 Vercel 配置调整 | Web 正常部署，mobile 静态包正常构建 |
| 5 | Mac Capacitor 工程与原生存储适配 | 真机衣橱持久化、账户和图片处理通过 |
| 6 | TestFlight 与 App Store 材料 | 第 3.6 节验收通过 |

第 2、3 项属于同一个 Web 交付范围，可以分批实现，但进入 iOS 阶段前都需要完成。供应商、原生插件和正式 Bundle ID 是实施前待确定的具体配置；本地衣橱、保留 Next.js、Vercel API 和先 Web 后 iOS 的方向已确认。
