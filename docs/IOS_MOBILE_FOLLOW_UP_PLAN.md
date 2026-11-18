# iOS Mobile Follow-up Plan

更新时间：2026-11-18

本文件记录本地真机 MVP 的后续三项工作；图片压缩和“保留原图保存”的备用路径单独优先实施。

## Typography decision: iOS input zoom

Body token 已统一改为 `16px`，因此所有原来引用 `--font-size-body` 的正文、表单值和主要按钮会遵循同一标准；`12px` UI/辅助文字和标题 token 保持不变。iOS WebKit 会在可编辑控件字号小于 16px 时自动放大页面，所以移动端也明确将 `input`、`select` 和 `textarea` 保持在至少 `16px`。这让可编辑内容使用可读字号，并避免键盘聚焦后的残留放大，而不禁用用户自己的缩放功能。

## 1. Prevent keyboard focus zoom

目标：输入名称、邮箱、验证码或其他文字时，页面不再因 iOS 自动缩放而停留在放大状态。

实施：

1. 将全局 `--font-size-body` token 和 Typography 文档统一为 `16px`。
2. 在移动端媒体条件下，明确为可编辑控件设置 `font-size: 16px`，防止局部样式意外覆盖。
3. 不使用 `user-scalable=no`，避免破坏用户缩放和无障碍行为。
4. 在真机验证名称、邮箱、验证码、键盘收起、对话框滚动及 Save 按钮可触达性。

验收：聚焦和失焦各类字段后，页面 viewport 不发生残留放大。

## 2. Replace native category select with a custom picker

目标：Add/Edit Item 的分类选择不再触发 iOS 系统玻璃样式 `select` 弹窗，而使用 E-Closet 自己的视觉语言。

实施：

1. 用按钮显示当前分类或 “Choose a category”。
2. 点击后打开 App 内自定义弹层，列出 `CLOTHING_CATEGORIES` 的六个选项。
3. 实现已选状态、取消/关闭、点击选择后回填、键盘操作和屏幕阅读器语义。
4. 保留当前分类类型校验，不更改 IndexedDB 数据格式。

验收：iPhone 上不出现原生 picker；选择结果正确保存并在编辑时正确回显。

## 3. Implement Gate B mobile account authentication

目标：完成邮箱 OTP 登录、Profile、登出、会话恢复和账户本地分区真机验收；不实现云端衣橱备份。

实施顺序：

1. 为 mobile build 配置公开的 `NEXT_PUBLIC_API_BASE_URL`（Vercel HTTPS 地址），并重新构建 iOS 静态包。
2. 为移动端 API 增加严格 CORS / `OPTIONS`：只允许所需 origin、方法、`Content-Type`、`Authorization`，并在成功和错误响应设置 `Vary: Origin`。
3. 后端接受并验证 `Authorization: Bearer <access token>`；Web 仍使用 HttpOnly Cookie，不能把 CORS 当成认证。
4. 选择并接入 iOS Keychain / secure-storage 保存刷新令牌；访问令牌仅保留在内存，不能写入 IndexedDB、Preferences 或 ZIP。
5. 将移动端 `AccountProvider` 从“启动固定 Guest”改为：先即时打开 Guest，本地会话恢复成功后无破坏地切换账户分区；401、过期或网络失败回到 Guest，不删除账户衣橱。
6. 实现并真机测试：OTP、Profile 读取与头像、登出、冷启动恢复、过期会话、Guest / Account 分区切换。

验收：Guest Gate A 与 Account Gate B 都通过；账户 ZIP Import / Export 单独验证，云端衣橱备份仍不在本阶段范围内。
