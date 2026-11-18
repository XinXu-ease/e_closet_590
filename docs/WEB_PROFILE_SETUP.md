# Web Profile：实现与配置

## 2026-11-16：第一版使用邮箱验证码

当前默认登录方式为邮箱验证码；手机号默认关闭。已有两张表和三个 AUTH_PROVIDER 配置继续使用，不需要重建数据库。账户和本地衣橱仍按用户 UUID 关联。邮箱和手机号由 Supabase Auth 管理，不存入衣橱导出文件；Profile 显示脱敏的邮箱。当前没有提供更换邮箱界面。

### 现在需要在 Supabase 完成的配置

1. Authentication → Sign In / Providers → Email：保持 Email 开启、邮箱确认开启，并允许新用户注册。Phone 可以保持关闭。
2. Authentication → Email Templates（部分界面位于 Emails）→ Magic Link：将正文替换为下面的 HTML。Confirm signup 模板也使用同样正文，确保首次注册邮件也包含数字验证码。标题可填 `Your E-Closet verification code`。

```html
<h2>E-Closet</h2>
<p>Your verification code is:</p>
<p><strong>{{ .Token }}</strong></p>
<p>Return to E-Closet and enter this code. If you did not request it, ignore this email.</p>
```

这里必须使用 `{{ .Token }}`，不是短信模板的 `{{ .Code }}`。本项目采用输入验证码的方式，没有实现点击 Magic Link 自动登录的回调。建议邮箱验证码有效期 600 秒；界面接受 6–8 位数字，与项目 Email OTP Length 保持一致。参见 [Supabase Email OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless)。

3. 初次开发测试可以使用你在 Supabase 组织中的成员邮箱。默认邮件服务只发给组织成员邮箱，且限流很低；普通用户注册前必须在 Supabase 中配置自定义 SMTP（例如 Resend）。SMTP 凭证填在 Supabase 控制台，无需写入本地环境变量。参见 [SMTP 设置和限制](https://supabase.com/docs/guides/auth/auth-smtp)。
4. 本地 `.env.local` 中保持原来的 URL、Publishable Key、Secret Key，添加 `AUTH_PHONE_ENABLED=false`（不设置也默认关闭）。重启开发服务器，在 Profile → Log in / Register 中输入邮箱、收件后输入验证码。
5. 需要验证码的再次验证（例如注销账户）会发送到服务端核实过的当前账户邮箱，不能通过表单把验证码发送目标替换成别人的邮箱。原有持久化限流同样保护邮件发送和验证。

### 以后启用手机号

配置 Supabase Phone 和短信供应商后，在本地及 Vercel 设置 `AUTH_PHONE_ENABLED=true` 并重新部署。邮箱登录继续保留，登录界面增加 Phone 选项；已登录用户可以在 Information 中添加或更换号码。先验证已有账户身份，再验证新手机号，维持同一个用户 UUID。不要先退出并用一个未绑定号码重新注册，否则会创建独立账户而不是合并已有邮箱账户。

以下为原手机号阶段说明，涉及短信供应商的步骤在启用手机号时再执行。当前邮箱流程以本节为准。自动测试使用模拟的邮件接口，不表示真实邮件发送已通过联调。

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

`AUTH_PROVIDER_URL` 必须是项目根地址，例如 `https://YOUR_PROJECT.supabase.co`，不能带 `/rest/v1/`、`/auth/v1/` 或控制台路径。误填 Data API 完整地址会导致验证码限流函数报 `PGRST125`，页面显示 `Account service is temporarily unavailable.`。修改环境变量后重启本地服务器；Vercel 则需要重新部署。

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

本次仅完成 Web 阶段，未新增 iOS 工程。长期技术方向见 [`PROFILE_AND_CAPACITOR_PLAN.md`](./PROFILE_AND_CAPACITOR_PLAN.md)；当前“Mac + 自有 iPhone、暂不上架”的独立执行清单见 [`IOS_LOCAL_DEVICE_MVP_PLAN.md`](./IOS_LOCAL_DEVICE_MVP_PLAN.md)。当前 API 使用同源 Cookie；原生封装阶段必须专门适配 API 基地址、原生会话存储与认证传递、来源校验，不能只增加 Capacitor 配置便直接发布。
# Profile MVP update: custom avatars

Before deploying custom avatar uploads, run `supabase/migrations/202611160001_profile_avatar.sql` in the Supabase SQL Editor after the original profile migration. It adds the private `profile-avatars` storage bucket and profile fields used by the web app. Do not make this bucket public: the application serves each avatar only after checking the signed-in user.

Avatar images are prepared in the browser as a square JPEG and limited to 512 KB. Clothes, outfit images, and outfit data remain in browser storage in this MVP; cloud wardrobe backup is intentionally not part of this setup.
