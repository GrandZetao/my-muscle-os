# Muscle OS Vercel 部署与排障记录

本文记录 Muscle OS 从本地 Next.js 项目发布到 Vercel 的完整流程，以及本次部署中遇到的真实问题。文档既可作为后续更新手册，也可用于排查“部署显示 Ready，但网站仍然 404”的情况。

## 1. 最终部署状态

- Vercel 团队：`grandzetaos-projects`
- Vercel 项目：`muscle-os`
- 生产地址：<https://muscle-os.vercel.app>
- 框架：Next.js 16 App Router
- 生产状态：`READY`
- 当前访问策略：SSO Protection 已关闭，生产地址可公开访问
- 当前数据模式：未配置 Supabase 时使用浏览器本地 IndexedDB，不同浏览器和设备的数据相互独立

本次修复后的生产部署为：

- Deployment ID：`dpl_DuCDsi2Cj3qY8KMHgvAszJTGQWaf`
- [Vercel 部署详情与构建日志](https://vercel.com/grandzetaos-projects/muscle-os/DuCDsi2Cj3qY8KMHgvAszJTGQWaf)

部署 ID 会随每次发布改变，日常使用时应以稳定生产域名为准。

## 2. 部署前检查

建议使用 Node.js 22，并在项目根目录打开不加载个人配置的 PowerShell：

```powershell
pwsh -NoProfile
```

安装依赖并完成基础验证：

```powershell
npm install
npm run typecheck
npm run lint
npm run build
```

如需执行完整自动化测试，应在获得项目负责人授权后再运行：

```powershell
npm run test
npm run test:e2e
```

确认以下文件不会进入 Git：

```gitignore
.env*
.vercel
```

`.env.local` 可能包含 Vercel OIDC Token 或 Supabase 配置，`.vercel/project.json` 包含本地项目关联信息；二者都不应提交到仓库。

## 3. 推荐的首次部署流程

### 3.1 登录 Vercel

本文使用部署时验证过的 CLI 版本，避免 `latest` 在未来产生不兼容变化：

```powershell
npx --yes vercel@58.9.0 login
npx --yes vercel@58.9.0 whoami
```

### 3.2 创建、配置并关联项目

如果项目尚不存在：

```powershell
npx --yes vercel@58.9.0 project add muscle-os
```

创建后必须立即确认框架是 Next.js。不要假设 Vercel 一定会自动识别：

```powershell
npx --yes vercel@58.9.0 project update muscle-os `
  --framework nextjs `
  --auto-detect build-command `
  --auto-detect output-directory `
  --auto-detect install-command
```

将本地目录关联到正确团队和项目：

```powershell
npx --yes vercel@58.9.0 link `
  --project muscle-os `
  --scope grandzetaos-projects `
  --yes
```

检查项目配置：

```powershell
npx --yes vercel@58.9.0 project inspect muscle-os
```

期望看到：

```text
Root Directory      .
Framework Preset    Next.js
```

如果显示 `Framework Preset: Other`，不要继续部署，先执行上面的 `project update` 修正。

### 3.3 配置访问策略

查看当前保护状态：

```powershell
npx --yes vercel@58.9.0 project protection muscle-os --json
```

需要普通浏览器、手机或外部自动化工具直接访问时，关闭 Vercel SSO Protection：

```powershell
npx --yes vercel@58.9.0 project protection disable muscle-os --sso
```

如果应用尚未配置自身登录系统，关闭 SSO 后网站界面将公开。Muscle OS 当前未配置 Supabase 时只在浏览器本地保存训练数据，因此其他访问者看不到当前设备的数据，但仍建议尽快完成 Supabase 单邮箱登录后再长期公开。

需要恢复 Vercel 访问保护时：

```powershell
npx --yes vercel@58.9.0 project protection enable muscle-os --sso
```

### 3.4 发布生产版本

首次发布或修正框架配置后建议强制执行一次全量构建：

```powershell
npx --yes vercel@58.9.0 deploy --prod --yes --force --logs
```

正常构建应包含以下关键信息：

```text
Detected Next.js version: 16.3.0
Compiled successfully
Finished TypeScript
Generating static pages ... 73/73
Build Completed in /vercel/output
Deployment completed
status Ready
```

后续普通更新可使用：

```powershell
npx --yes vercel@58.9.0 deploy --prod --yes --logs
```

## 4. 部署后验证

### 4.1 检查部署是否存在

```powershell
npx --yes vercel@58.9.0 ls muscle-os
npx --yes vercel@58.9.0 inspect muscle-os.vercel.app
```

必须确认环境为 `Production` 且状态为 `Ready`。

### 4.2 检查别名

```powershell
npx --yes vercel@58.9.0 alias list
```

确认 `muscle-os.vercel.app` 指向最新生产部署。别名正确不代表页面一定可访问，还必须做匿名 HTTP 检查。

### 4.3 匿名检查首页

不要只在已经登录 Vercel 的浏览器中验证。使用普通请求确认外部设备可以访问：

```powershell
$response = Invoke-WebRequest `
  -Uri "https://muscle-os.vercel.app/" `
  -Method Get `
  -SkipHttpErrorCheck

[PSCustomObject]@{
  Status      = [int]$response.StatusCode
  ContentType = $response.Headers["Content-Type"]
  VercelError = $response.Headers["X-Vercel-Error"]
  IsMuscleApp = $response.Content -match "今日训练|MUSCLE OS|训练控制台"
}
```

期望结果：

```text
Status      200
ContentType text/html; charset=utf-8
VercelError
IsMuscleApp True
```

如果状态为 200，但内容是 Vercel 登录页面，也不能算首页验证通过。

### 4.4 真实浏览器检查

至少确认：

- URL 为 `https://muscle-os.vercel.app/`
- 页面标题为 `MUSCLE OS`
- “今日训练”区域可见
- “开始今天的训练”按钮可见
- 首页、动作、训练、营养、我的导航可见
- 浏览器控制台没有阻断型错误

本次 Chromium 验证中页面已正常渲染，但发现一条非阻断的 React hydration `#418` 警告。它不影响本次上线和手机访问，但应作为独立前端问题继续处理。

## 5. 本次遇到的坑与解决方法

### 5.1 Vercel CLI 登录遇到 ByteString 错误

现象：

```text
No existing credentials found. Starting login flow...
Error: Cannot convert argument to a ByteString because the character ... is greater than 255.
```

根因：Windows 电脑名包含中文。Vercel CLI 58.9.0 在登录请求中使用了系统 hostname，Node.js 的 HTTP Header 不接受该非 ASCII 字符。

临时解决办法是在登录进程中覆盖 hostname，不需要永久修改电脑名称：

```powershell
Set-Content -LiteralPath ".vercel-hostname-shim.cjs" `
  -Value 'require("node:os").hostname = () => "muscle-deploy";' `
  -Encoding utf8

$env:NODE_OPTIONS = "--require=./.vercel-hostname-shim.cjs"
npx --yes vercel@58.9.0 login

Remove-Item Env:NODE_OPTIONS
Remove-Item -LiteralPath ".vercel-hostname-shim.cjs"
```

该文件只用于登录兼容，不应提交到仓库。

### 5.2 显示 Ready，但所有地址都是 404

这是本次最关键的问题。

表面现象：

- Vercel 显示 `Ready`
- `next build` 显示成功
- TypeScript 通过
- 73 个页面全部生成
- 三个域名别名都存在
- 访问任何地址仍返回 `X-Vercel-Error: NOT_FOUND`

真实根因：项目先通过 `vercel project add` 创建，Vercel 将 `Framework Preset` 设成了 `Other`。在该模式下，默认输出目录是 `public` 或项目根目录。虽然 `npm run build` 正常生成 `.next` 和 Vercel Output API 产物，Vercel 最终却没有按 Next.js 应用发布这些输出，因此根路径没有可用路由。

诊断命令：

```powershell
npx --yes vercel@58.9.0 project inspect muscle-os
```

错误配置：

```text
Framework Preset    Other
Output Directory    public if it exists, or .
```

修复命令：

```powershell
npx --yes vercel@58.9.0 project update muscle-os `
  --framework nextjs `
  --auto-detect build-command `
  --auto-detect output-directory `
  --auto-detect install-command

npx --yes vercel@58.9.0 deploy --prod --yes --force --logs
```

修复后构建日志新增了关键行：

```text
Detected Next.js version: 16.3.0
Applying modifyConfig from Vercel
Running onBuildComplete from Vercel
```

随后匿名访问三个地址均返回 HTTP 200。

### 5.3 SSO Protection 让外部访问看起来像 404

项目初始配置为：

```json
{
  "ssoProtection": {
    "deploymentType": "all_except_custom_domains"
  }
}
```

这会保护所有 `*.vercel.app` 地址。没有对应团队权限的浏览器、手机或自动化工具可能看到登录页或 404，请求不会进入 Next.js。

检查与修复：

```powershell
npx --yes vercel@58.9.0 project protection muscle-os --json
npx --yes vercel@58.9.0 project protection disable muscle-os --sso
```

本次先关闭 SSO 后仍然 404，说明它不是唯一问题；继续检查才发现真正的框架预设错误。排障时不要在发现第一个可疑配置后停止验证。

### 5.4 看不到 Runtime Logs，不代表部署失败

本项目大多数页面为静态生成。请求被 Vercel 边缘层拦截或路由直接返回 404 时，不会进入 Next.js Function，因此：

```powershell
npx --yes vercel@58.9.0 logs muscle-os.vercel.app --since 1h --level error
```

可能只返回：

```text
No logs found for grandzetaos-projects/muscle-os
```

此时应检查构建日志，而不是继续等待运行日志：

```powershell
npx --yes vercel@58.9.0 inspect <deployment-id-or-url> --logs
```

构建日志负责回答“是否编译和产出成功”，匿名 HTTP 验证负责回答“外部用户是否真的能访问”。两者缺一不可。

### 5.5 TinyFish 无法访问本机 localhost

远程浏览器自动化环境无法访问 Codex 所在电脑的 `127.0.0.1:3000`。因此即使本地服务正常运行，TinyFish 仍会看到连接失败。

正确流程是：

1. 本地完成类型检查、构建和基础浏览器检查。
2. 部署到可公开访问的 HTTPS 地址。
3. 确认 SSO 或其他保护不会阻挡自动化工具。
4. 再让 TinyFish 使用生产或 Preview URL 执行验收。

## 6. 404 排障顺序

遇到 Vercel 404 时，按以下顺序检查，避免反复重新部署但不解决配置问题：

1. 使用 `vercel ls muscle-os` 确认部署存在且是 `Ready`。
2. 使用 `vercel inspect <deployment> --logs` 确认构建完成。
3. 使用 `vercel project inspect muscle-os` 确认 `Framework Preset: Next.js`。
4. 使用 `vercel alias list` 确认生产域名指向最新部署。
5. 使用 `vercel project protection muscle-os --json` 检查 SSO、密码或 IP 保护。
6. 使用未登录的 `Invoke-WebRequest` 检查 HTTP 状态、`Content-Type` 和 `X-Vercel-Error`。
7. 使用真实浏览器确认页面内容与控制台。
8. 以上均正确后，再检查 Vercel Status 或联系 Vercel Support。

核心判断：

> `READY` 只代表 Vercel 完成了构建和部署流程，不代表域名已经把正确的应用输出提供给最终用户。

## 7. 后续发布操作清单

每次更新建议执行：

```powershell
npm run typecheck
npm run lint
npm run build
npx --yes vercel@58.9.0 deploy --prod --yes --logs
```

发布后检查：

- Vercel 状态为 `Ready`
- 构建日志中识别到 Next.js
- `https://muscle-os.vercel.app/` 匿名请求返回 200
- 首页包含 Muscle OS 内容
- 手机端可以加载并切换主要页面
- PWA manifest 和 `/sw.js` 可以访问
- 浏览器控制台没有新增阻断型错误

涉及 Supabase、登录回调或数据库迁移时，还要额外确认 Production 环境变量和回调 URL，不要只验证本地 `.env.local`。

## 8. 常用链接

- [Muscle OS 生产站点](https://muscle-os.vercel.app)
- [Vercel 项目](https://vercel.com/grandzetaos-projects/muscle-os)
- [Vercel Deployments 文档](https://vercel.com/docs/deployments)
- [Vercel Deployment Protection 文档](https://vercel.com/docs/deployment-protection)
- [Vercel CLI 文档](https://vercel.com/docs/cli)

