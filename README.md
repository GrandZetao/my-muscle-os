# Muscle OS

个人专属的增肌训练、动作教学与营养规划 PWA。默认使用浏览器 IndexedDB 离线保存；配置 Supabase 后启用单邮箱魔法链接和跨设备同步。

## 本地启动

要求 Node.js 20.9+（当前工程创建于 Node.js 22）。

```powershell
npm install
npm run dev
```

打开 `http://localhost:3000`。未配置环境变量时自动进入本地模式，适合先体验完整流程。

## Supabase 私有同步

1. 在 Supabase 新建项目，执行 `supabase/migrations/202608090001_personal_fitness.sql`。
2. 向允许名单写入唯一邮箱：

   ```sql
   insert into private.allowed_emails(email)
   values ('your-email@example.com')
   on conflict do nothing;
   ```

3. 在 Authentication → Hooks 中将 **Before User Created** 指向 `public.hook_restrict_personal_email`。
4. 复制 `.env.example` 为 `.env.local`，填写项目 URL、publishable key 和同一邮箱。
5. 在 Supabase URL Configuration 中加入本地与 Vercel 的 `/auth/confirm` 回调地址。

RLS 会把所有云端记录限制到当前 `auth.uid()`；不要把 Supabase secret/service-role key 放进 `NEXT_PUBLIC_*` 环境变量。

## Vercel 与 PWA

- 将仓库导入 Vercel，配置与本地相同的三个公开环境变量。
- 构建脚本使用 Webpack，以便 Serwist 生成离线 service worker。
- 首次在线打开需要使用的页面后，应用外壳、动作内容和本地记录可离线访问。
- 设置页支持一键导出/导入版本化 JSON；导入前会先下载当前快照。
- 首次部署、生产更新和 404 排障参见 [Vercel 部署与排障记录](docs/VERCEL_DEPLOYMENT.md)。

## 验证命令

仓库规则要求只有在用户明确授权时才执行测试。

```powershell
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build
```

自动化浏览器测试属于同一台电脑上的模拟验证；真实 Android/iPhone、第二台电脑、弱网同步和跨设备冲突仍需单独验收。
