# E-Closet iOS 本地真机 MVP 计划

更新时间：2026-11-17

状态：待实施。本文只规划“用 Capacitor 包装现有前端，在 Mac 上构建，并安装到自己的 iPhone 真机测试”。暂不包含 TestFlight、App Store 上架、云端衣橱备份或正式生产迁移。

关联文档：

- [PROFILE_AND_CAPACITOR_PLAN.md](./PROFILE_AND_CAPACITOR_PLAN.md)：完整的 Web Profile、长期技术栈和 App Store 方向。
- [PROFILE_MVP_PLAN.md](./PROFILE_MVP_PLAN.md)：当前 Profile 与本地衣橱规则。
- [WEB_PROFILE_SETUP.md](./WEB_PROFILE_SETUP.md)：Supabase 与 Web 账户配置。

## 1. 当前阶段

### 已完成或已具备

- Web 端主要页面和 UI 已接近当前设计目标，包括 Closet、Item Detail、Create / Saved Outfit、Profile 和 Settings。
- 账户采用 Supabase 邮箱验证码登录；Next.js Route Handlers 在服务端管理会话和个人资料。
- 用户名字和头像属于云端账户资料；衣物、图片 Blob 和 Outfit 仍保存在本地。
- 本地数据使用 Dexie / IndexedDB，并按游客或账户 ID 分区。
- 已有本地 ZIP Export / Import；云端衣橱备份和跨设备恢复属于第二阶段。
- remove.bg、天气和账户接口目前通过 Next.js `/api/*` 路由访问，部署目标仍是 Vercel。

### 尚未开始

- `package.json` 中尚无 Capacitor 依赖。
- 仓库中尚无 `capacitor.config.*` 和 `ios/` 原生工程。
- 当前 Next.js 应用还不是可直接交给 Capacitor 的静态包：
  - `/items/[id]` 和 `/outfits/[id]` 依赖运行时动态路径；
  - `/` 使用服务端 redirect；
  - `/api/*` Route Handlers 只能运行在 Vercel / Node 服务端，不能被打进离线 WebView；
  - API 客户端现在使用相对地址和同源 Cookie，会依赖 Web 站点的 origin。

因此，下一阶段的核心不是“添加一个 iOS 文件夹”这么简单，而是先形成一个可以静态导出的移动端前端，再让它通过 HTTPS 调用 Vercel API。

## 2. MVP 目标与边界

### 本阶段目标

1. 在 Mac 上从当前仓库构建出 Capacitor iOS 工程。
2. 通过 Xcode 把 App 安装到自己的 iPhone，并可重复运行和调试。
3. App 的页面资源打包在应用内；断网冷启动时，至少本地衣橱页面可以打开。
4. 在真机完成添加衣物、读取照片、编辑衣物、制作 Outfit、保存和重新打开。
5. 杀掉 App、重开 App和重启手机后，本地数据仍在；删除 App 后允许数据随应用容器一起删除。
6. 在线时可调用 Vercel 上的账户、remove.bg 和天气接口；失败时给用户可理解的状态。

### 明确不在本阶段

- TestFlight、App Store Connect、审核材料、商店截图和正式上架。
- 云端上传衣橱、跨设备恢复或多人同步。
- 推送通知、内购、订阅、Universal Links。
- 为正式发布完成全部原生数据迁移。
- Android 打包。

## 3. 两个真机里程碑

### M0：远程页面冒烟测试，可选

Capacitor 临时加载 Mac 局域网开发地址或 Vercel Preview，用来尽快检查：安全区域、触摸、滚动、键盘、照片选择器和 WebView 布局。

这一步只能证明“页面能在 iPhone WebView 里运行”，不能证明 App 可以离线启动，也不能作为 MVP 完成标准。`server.url` 只用于临时 live reload，不写入正式配置、不提交到生产分支。Capacitor 官方同样把外部 URL 用于 live reload，并提醒不要提交该配置。

### M1：本地资源真机包，必须完成

Next.js 生成静态目录，Capacitor 把该目录复制进 iOS 工程；App 启动时读取自身资源，而不是打开某个网站。M1 才是本计划所说的“iOS 本地真机 MVP”。

## 4. 已确定的技术方向

| 领域 | 本地真机 MVP | App Store 前的长期方向 |
| --- | --- | --- |
| UI 与业务逻辑 | 继续复用 Next.js / React / TypeScript / CSS Modules | 保持共享，不重写 SwiftUI |
| iOS 容器 | Capacitor 8 + WKWebView | 延续 Capacitor |
| 页面资源 | Next.js 静态导出后打进 App | 同左 |
| 服务端 API | 继续部署在 Vercel | 同左，并强化配额和监控 |
| 衣橱数据 | 先保留 Dexie / IndexedDB，完成自有真机验证 | 外部测试或上架前评估迁移到 SQLite |
| 图片 | MVP 先保留当前 Blob 流程 | 上架前评估 Filesystem + 数据库路径 |
| 账户 | Supabase 邮箱 OTP，Vercel API | 同左，补齐移动端安全会话 |
| 云端衣橱 | 不做 | 第二阶段的手动上传／恢复 |

MVP 暂时保留 IndexedDB 是为了最快验证完整产品流程，不代表它已被认定为正式 iOS 存储方案。验收必须特别覆盖强制退出、手机重启和覆盖安装；卸载 App 后数据删除属于预期行为。

## 5. 实施步骤

### 阶段 0：固定 Web 基线

- 确认当前分支可通过 lint、单元测试和生产构建。
- 用 Export 保存一份可导回的测试衣橱 ZIP。
- 记录当前 Web 回归清单，避免 iOS 适配破坏浏览器版本。
- Capacitor 和 Next.js 使用锁文件中的确定版本，不用未固定的 `latest` 作为跨 Windows / Mac 的长期基线。

完成条件：Web 基线可复现，并有一份手动备份。

### 阶段 1：建立独立的移动端静态入口

采用主规划中的“Web 服务端入口与 Mobile 静态入口分开”方向。移动端复用现有组件、样式、Dexie 数据层和类型，但不把 Next.js `/api/*` 目录当作本地资源。

需要完成：

1. 新建移动端构建入口，例如 `apps/mobile`，并逐步把共享代码放入可同时被 Web 和 Mobile 使用的位置。
2. 移动端 Next 配置使用静态导出：`output: "export"`、`trailingSlash: true`，并关闭运行时图片优化。
3. 将移动端运行时详情地址改为静态壳页面加查询参数，例如：
   - `/items/edit/?id=<local-id>`
   - `/outfits/edit/?id=<local-id>`
4. 将根页面的服务端 redirect 改成静态可用的入口或客户端导航。
5. 确保移动端构建产物根目录存在 `index.html`，并由 Capacitor `webDir` 指向该目录。
6. 禁止移动端静态构建意外依赖 Server Components、Cookie、动态 Route Handlers 或其他需要 Node 服务器的能力。

完成条件：在 Windows 和 Mac 上都能生成同一类静态输出；直接检查输出目录时包含全部页面资源且没有构建错误。

### 阶段 2：统一 API 地址和运行环境

当前 `api-client.ts`、remove.bg 和天气调用使用 `/api/...` 相对地址。在 `capacitor://localhost` 中，它们不会自动指向 Vercel，必须改为统一 API 客户端：

- Web：默认使用同源 `/api`。
- iOS：读取公开的 HTTPS API Base URL，例如 Vercel Production 或 Preview 地址。
- 只有可公开的地址进入前端环境变量；Supabase service role、remove.bg key、SMTP 密码继续只放 Vercel 服务端。
- 统一处理超时、无网络、401、429 和服务器错误。
- Vercel 端只允许所需方法、Header 和可信 origin；CORS 不是身份认证，服务端仍必须验证会话。

建议新增一个明确的移动端环境示例文件，但不提交真实密钥。

完成条件：同一套页面在 Web 使用相对 API，在 iOS 静态包使用 Vercel HTTPS API，且秘密不会出现在构建产物中。

### 阶段 3：处理移动端登录会话

这是当前架构最需要单独验证的部分。Web 端依赖同源 HTTP-only Cookie；静态 App 的 origin 是 `capacitor://localhost`，不能假设现有 `credentials: "same-origin"` 会自动工作。

实施顺序：

1. 先让游客衣橱在 M1 包中完整工作，避免登录问题阻塞本地功能测试。
2. 为移动端设计明确的 Supabase session 传递：由移动端持有短期会话，并以 Bearer token 调用 Vercel；服务端验证 token 后再访问 Profile。
3. 刷新令牌使用受控的安全存储；不要把 service role key 或服务端密钥放进 App。
4. 配置并验证 `capacitor://localhost`、Vercel 域名和 Preview 域名涉及的 CORS / redirect 行为。
5. 回归新用户验证码、旧用户登录、Profile 读取、头像上传、注销和过期会话。

本阶段允许设置两个验收门：

- Gate A：游客本地衣橱真机可用。
- Gate B：邮箱登录和 Profile 真机可用。

只有 Gate B 完成后，才把账户功能计入 iOS MVP 完成范围。

### 阶段 4：接入 Capacitor

在移动端静态输出稳定后再安装并初始化 Capacitor。版本以实际锁定的 Capacitor 8 同一小版本为准，`core`、`cli` 和 `ios` 保持一致。

预期命令结构：

```bash
npm install @capacitor/core @capacitor/ios
npm install --save-dev @capacitor/cli
npx cap init
npx cap add ios
npm run mobile:build
npx cap sync ios
npx cap open ios
```

配置至少包含：

```ts
const config = {
  appId: "com.yourname.ecloset",
  appName: "E-Closet",
  webDir: "<mobile-static-output>",
};
```

规则：

- `npx cap add ios` 通常只执行一次；之后构建 Web，再运行 `npx cap sync ios`。
- 默认使用 Capacitor 8 推荐的 Swift Package Manager；没有插件要求时不额外引入 CocoaPods。
- 正式 M1 配置不保留 `server.url`。
- `ios/` 是否提交仓库在第一次生成后确认；若提交，原生配置变更必须和 Web 变更一起评审。

完成条件：`npx cap sync ios` 能把最新静态资源复制到 iOS 工程，Xcode 可打开工程且没有缺失资源。

### 阶段 5：Mac 环境和 Xcode 真机安装

Capacitor 8 当前官方最低要求是 Node.js 22、Xcode 26.0；iOS 15 及以上受支持。Mac 上安装：

- 与仓库约定一致的 Node 主版本；
- Xcode 26 或更高；
- Xcode Command Line Tools；
- Git。

检查命令：

```bash
node --version
npm --version
xcodebuild -version
xcode-select -p
```

Mac 操作顺序：

1. 只同步源码和锁文件，不从 Windows 复制 `node_modules`。
2. 运行 `npm ci`，再运行移动端静态构建和 `npx cap sync ios`。
3. 运行 `npx cap open ios`。
4. 在 Xcode 登录 Apple Developer Program 账户或个人 Apple Account。
5. 在 Target 的 **Signing & Capabilities** 中开启自动签名，选择自己的 Team，填写唯一 Bundle Identifier。
6. 用 USB 连接 iPhone，完成“信任此电脑”和 Xcode 配对。
7. 在 iPhone 的 **Settings > Privacy & Security > Developer Mode** 开启开发者模式并按提示重启。
8. 在 Xcode 选择该 iPhone 作为 Run Destination，点击 Run。

Apple 官方允许 Xcode 使用个人 Apple Account 设置真机开发签名；这一阶段不要求先购买 App Store 上架资格。免费个人签名可能有能力和有效期限制，因此它只适合自有设备开发验证，不作为发布方案。

完成条件：Xcode 成功安装并启动 App，拔线后可再次打开已安装的开发包。

## 6. 原生权限与适配检查

第一版只申请实际使用的权限：

- 照片选择：优先使用系统照片选择器；如插件要求，在 `Info.plist` 提供清楚的用途说明。
- 相机：当前没有拍照入口就不申请。
- 定位：天气功能触发时再申请；拒绝后 Outfit 编辑仍可用。
- 网络：所有远程请求使用 HTTPS。

同时检查：

- iPhone 刘海／Dynamic Island 和底部 Home Indicator 的 safe area。
- 键盘弹出后输入框和 Save 按钮仍可触达。
- 页面滚动、横向筛选条、拖拽缩放 Outfit 在触摸环境中正常。
- 外部链接、下载 ZIP 和导入 ZIP 在 WKWebView 中的行为；必要时用 Capacitor 插件替换浏览器专用下载方式。

## 7. 真机验收清单

### 安装与启动

- [ ] Xcode 能构建并安装到指定 iPhone。
- [ ] 无网络时冷启动可进入本地 Closet，而不是白屏或网站错误页。
- [ ] App 图标、名称、启动背景和安全区域正常。
- [ ] M1 配置中不存在远程 `server.url`。

### 本地衣橱

- [ ] 游客可添加、查看、编辑、删除衣物。
- [ ] 从照片库选择 JPEG、PNG、WebP 的可支持范围已验证。
- [ ] 原图、抠图结果、名称、分类和 Tape tag 保存正确。
- [ ] 可创建、编辑、保存和重新打开 Outfit。
- [ ] Outfit 拖动、缩放、图层和删除在触摸屏工作。
- [ ] 强制关闭 App 后数据仍在。
- [ ] 重启 iPhone 后数据仍在。
- [ ] 用 Xcode 覆盖安装新构建后数据仍在。
- [ ] 删除 App 后本地数据被删除，重新安装得到空衣橱。

### 网络功能

- [ ] 在线时 remove.bg 成功；超时或限额时不会破坏原图。
- [ ] 允许定位时显示天气；拒绝定位时不阻塞 Outfit。
- [ ] 无网时远程功能显示清楚错误，本地功能继续可用。

### 账户 Gate B

- [ ] 邮箱验证码可发送和验证。
- [ ] 新用户首次 Profile 设置正常。
- [ ] 名字和头像上传、重开读取正常。
- [ ] 注销后账户衣橱不展示；重新登录同一账户可读取本机分区。
- [ ] 会话过期和刷新失败不会导致本地衣橱被删除。

### Import / Export

- [ ] iPhone 上能导出 ZIP 到系统分享／文件界面。
- [ ] 能从 Files 选择应用生成的 ZIP 并导入。
- [ ] 100 MB 限制和错误提示正常。

## 8. 预计代码与配置改动

实施时预计新增或修改：

- 移动端 Next.js 入口及静态导出配置。
- 查询参数版本的 Item / Outfit 编辑入口和统一路由 helper。
- `src/lib/api-client.ts` 的平台 API Base 与认证 Header 适配。
- remove.bg、天气、Profile 和头像调用的统一 API 封装。
- Capacitor 配置、构建脚本和生成的 iOS 工程。
- iOS 权限说明、Bundle Identifier、签名设置和图标资源。
- 针对静态路由、API URL、移动端认证和本地持久化的测试。
- `.env.example` 与 Mac 构建说明；不提交真实密钥或签名材料。

## 9. 开始实施前需要确认的输入

这些内容不影响先做静态入口，但在进入 Xcode 前必须明确：

- 可用 Mac 的 macOS 版本、芯片和能够安装的 Xcode 版本。
- 测试 iPhone 型号和 iOS 版本。
- 最终 Bundle Identifier，例如 `com.<owner>.ecloset`。
- Xcode 使用的 Apple Account / Team。
- iOS 测试连接的 Vercel Production 或 Preview API 地址。
- 第一轮真机是否只验收游客 Gate A，还是必须同时完成账户 Gate B。

## 10. 完成定义

当以下条件全部满足，本地真机 MVP 才算完成：

1. 静态资源打进 App，不依赖 Mac 开着开发服务器。
2. 自己的 iPhone 可从 Xcode安装、启动和重复调试。
3. 核心本地衣橱与 Outfit 流程通过真机验收。
4. 强制退出、重启和覆盖安装不会丢失本地数据。
5. Vercel 远程功能与离线状态均有明确结果。
6. 若本轮包含 Gate B，邮箱登录、Profile、注销和会话恢复通过真机验收。
7. Web 端原有功能没有因移动端适配回归。

完成本计划后，再单独制定“外部测试 / TestFlight / App Store”计划，包括 SQLite / Filesystem 决策、隐私清单、账户删除政策、商店资产和审核要求。

## 官方参考

- [Capacitor：Environment Setup](https://capacitorjs.com/docs/getting-started/environment-setup)
- [Capacitor：安装到现有 Web App](https://capacitorjs.com/docs/getting-started)
- [Capacitor：iOS 开发与真机运行](https://capacitorjs.com/docs/ios)
- [Apple：在模拟器或真机运行 App](https://developer.apple.com/documentation/xcode/building-and-running-an-app)
- [Apple：在设备上开启 Developer Mode](https://developer.apple.com/documentation/xcode/enabling-developer-mode-on-a-device)

