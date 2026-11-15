# Web Profile：实现与配置

## 当前实现

`/profile` 参考 Figma `AUTO / Profile`（137:790），使用本地设计素材。支持手机号验证码注册/登录、资料名称、预设头像、退出登录、更换手机号和注销账户。衣物和搭配统计来自当前账户的本地衣橱。`/login` 也可以直接打开登录界面。

云端只保存 Supabase Auth 账户和 `profiles` 的名称、头像标识、时间。手机号由 Auth 管理；客户端仅拿到脱敏号码。服务端通过 HttpOnly Cookie 管理会话，不把 Supabase token 或管理员密钥交给页面。

衣物、图片 Blob、搭配保留在 Dexie / IndexedDB。数据库 v2 将旧数据完整升级为游客衣橱；登录后可在 Settings 中明确确认迁入账户。数据按稳定的 Auth 用户 UUID 隔离，因此更换手机号不会新建衣橱。退出保留该账户在本机的数据。此隔离不是磁盘加密，不能代替设备访问保护。

Settings 支持 ZIP 导出、预览后导入、清空当前衣橱。导入会重建 ID 和搭配引用，不覆盖已有记录。注销需重新验证当前号码，再确认删除云端账户及当前浏览器中的该账户衣橱；其他设备的离线数据不能远程擦除。

**登录相同号码不能恢复另一台设备的衣橱。** 清除浏览器站点数据、换浏览器或更换网站域名都不能自动恢复本地图片，请使用 ZIP 备份。页面打开后账户服务暂时不可用时仍可使用缓存的本地衣橱；本版本没有实现离线首次加载所需的 Service Worker。

## 配置 Supabase

1. 创建 Supabase 项目。在 SQL Editor 中执行 [`../supabase/migrations/202611110001_profile.sql`](../supabase/migrations/202611110001_profile.sql)。它创建 profiles、持久化短信限流表及 RPC。表启用 RLS，浏览器角色不能直接读写，只有服务端 service role 访问。
2. 在 Auth 中启用 Phone 登录及短信验证，允许新用户注册，配置短信供应商。按 [Supabase Phone sign-in 文档](https://supabase.com/docs/guides/auth/phone-login) 操作。新号码首次验证成功即创建账户。
3. 本地 `.env.local` 中填写以下变量。所有变量均为服务端变量，不加 `NEXT_PUBLIC_` 前缀，不提交密钥。

```dotenv
AUTH_PROVIDER_URL=https://YOUR_PROJECT.supabase.co
AUTH_PROVIDER_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
AUTH_PROVIDER_SECRET_KEY=YOUR_SECRET_OR_SERVICE_ROLE_KEY
SUPPORT_EMAIL=your-real-support-address@example.com
REMOVE_BG_API_KEY=YOUR_EXISTING_KEY
```

4. 重启 `npm run dev`。未配置账户服务时，游客衣橱仍能使用，登录弹窗会明确显示服务尚未启用，不会模拟登录成功。
5. 先用独立开发项目的测试号码检查流程，再用真实号码验证短信送达。中国大陆 `+86` 和海外号码必须分别验证供应商路由、模板和项目配置；当前实现接受国际格式，但尚未验证两地的实际送达能力。

手机号修改先重新验证旧号码，再通过 `updateUser({ phone })` 发送新号码验证码，使用 `phone_change` 验证；仅当 Auth 返回的账户 UUID 和最终号码均匹配时成功。参考 [Supabase updateUser](https://supabase.com/docs/reference/javascript/auth-updateuser)。如果供应商额外要求验证，应先完成真实项目联调再开放此入口。

## Vercel

- 保持 Next.js Framework Preset，构建命令 `npm run build`。本阶段使用 Route Handlers，不能配置成纯静态导出。
- 在项目 Environment Variables 中配置上述变量，按需区分 Development、Preview、Production；Preview 建议使用独立测试项目。
- 保存环境变量后重新部署；生产域名通过 HTTPS 访问，前端与 `/api/*` 同源。服务端写操作校验 Origin 与 Host，不配置通配 CORS。
- 短信限制存储在数据库中，适用于无状态部署：发送每 IP 每分钟 5 次、每号码每分钟 1 次、全站每小时 500 次；验证每 IP 每分钟 12 次、每号码每 10 分钟 10 次、全站每小时 2000 次。供应商自身限流与预算也应配置。SQL 未安装时短信接口会失败关闭。
- 现有 remove.bg 接口独立于账户功能；此改动没有为该接口新增用量计费系统。

## 验证

```bash
npm ci
npm run lint
npm test
npm run build
npm run start -- --port 3100 --hostname 127.0.0.1
```

另一个终端运行 `npm run test:browser`。默认使用已安装的 Google Chrome；也可设置 `PLAYWRIGHT_CHANNEL=msedge` 使用 Edge。截图和测试临时文件写入忽略提交的 `.artifacts/`。

自动测试覆盖旧库迁移、账户数据隔离、过期账户写入拒绝、衣物删除关联搭配处理、ZIP 图片和搭配恢复、非法档案拒绝、Profile 表单、OTP 错误及倒计时、游客迁入、同源和未授权 API 拒绝。浏览器成功登录使用接口模拟，仅验证前端行为，不代表短信供应商已通过验证。

真实项目接通后仍需验收：首次注册、重复登录保持同一个 UUID、会话刷新、退出再登录、换号、旧号码失效、重新验证后注销，以及中国大陆和海外短信送达。核实数据库没有衣物或图片记录、密钥不出现在浏览器资源或网络响应中。

## 后续 Capacitor

本次仅完成 Web 阶段，未新增 iOS 工程。Mac / Xcode 环境、静态客户端与 Vercel API 分离步骤见 [`PROFILE_AND_CAPACITOR_PLAN.md`](./PROFILE_AND_CAPACITOR_PLAN.md)。当前 API 使用同源 Cookie；原生封装阶段必须专门适配 API 基地址、原生会话存储与认证传递、来源校验，不能只增加 Capacitor 配置便直接发布。
