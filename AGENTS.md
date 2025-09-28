# Repository Guidelines

## Project Structure & Module Organization
- `app/` — Next.js App Router (routes, layouts, API routes in `api/*/route.ts`). Route groups like `app/(auth-pages)` are for UX segmentation.
- `components/` — Reusable UI and feature components. `components/ui/` is the design system (Radix/shadcn-style).
- `utils/` — Helpers (Supabase clients, PDF templates, signatures, general utils).
- `hooks/` — Reusable React hooks.
- `types/` — Shared TypeScript types.
- `supabase/` — SQL migrations and scripts applied via Supabase Studio/CLI.
- `public/` — Static assets.
- Root configs: `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `tsconfig.json`, `middleware.ts`.
- Environment: `.env.example` → copy to `.env.local` for development.

## Build, Test, and Development Commands
- `npm run dev` — Start Next.js dev server on `http://localhost:3000`.
- `npm run build` — Production build.
- `npm start` — Start production server from `.next`.
- Env setup: `cp .env.example .env.local` (Unix) or `copy .env.example .env.local` (Windows).
- Supabase: run SQL from `supabase/migrations` using Supabase Studio or CLI when schema changes.

## Coding Style & Naming Conventions
- Language: TypeScript + React (App Router). Prefer Server Components; add `"use client"` only when needed.
- Formatting: Prettier defaults, 2‑space indent, double quotes, semicolons.
- Filenames: kebab-case (e.g., `name-generator-form.tsx`). Components/functions: PascalCase for React components, camelCase for functions/vars. Default exports are common for components.
- Imports: use path alias `@/*` per `tsconfig.json`.
- Styling: Tailwind CSS utility-first; keep class lists readable and co-locate minor styles with components.

## Testing Guidelines
- No test runner is configured yet. For new substantial features, add tests (recommend Vitest for unit, Playwright for e2e).
- Naming: `*.test.ts` / `*.spec.tsx` near source or under `tests/`.
- If you add tests, wire `npm test` accordingly and document in README.

## Commit & Pull Request Guidelines
- Commits: Prefer Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`). Keep them small and scoped.
- PRs: include a clear summary, linked issues, setup notes, and screenshots for UI changes. Call out schema changes and include migration SQL.

## Security & Configuration Tips
- Never commit secrets. Use `.env.local`. Only `NEXT_PUBLIC_*` vars are safe for the client. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
- If using Puppeteer, set `PUPPETEER_EXECUTABLE_PATH` appropriately on some deploy targets.


## pricing
使用前必须要先进行登录
1.免费用户每天免费次数为3次，付费用户暂不限制使用次数。
2.现在套餐分为单次购买50积分和月卡套餐订阅
3.每次使用图片api都会消耗5积分，用户可以在个人中心查看自己的积分情况。
4.月卡套餐用户不限制使用次数。

## feature

🟢 核心功能（MVP 必须有）

照片上传/拍摄

用户可以上传人脸照片，或直接调用摄像头拍照。

支持基本的图片格式（JPG/PNG/WebP）。

滤镜效果 – Baby / Youth / Childlike

主打“减龄化”“可爱化”效果（脸圆润、皮肤光滑、五官柔化）。

提供参数调节（强度：轻度 / 中度 / 高度）。

支持多种风格：

Youth Look（减龄/年轻化）

Cartoon Cute（卡通/动漫风）

Baby Smooth（皮肤细腻/可爱化）

即时预览 & 下载

用户处理后可直接预览效果。

提供下载（带水印 / 无水印区分免费与付费）。

🟡 增值功能（提升用户体验/差异化）

多阶段年龄滤镜

不止婴儿化，还可以做：小孩 → 青年 → 中年 → 老年。

类似 “Age progression” 或 “Time Machine” 功能，增强趣味性。

对比模式

前后对比滑动条（用户可一键查看变化前后）。

批量处理 / 多人合影识别

多人照片中可单独识别脸部，分别应用滤镜。

社交分享

一键分享到 Instagram、TikTok、Twitter、微信、朋友圈。

自动生成分享文案（例如 “Look how cute I am with the Baby Filter!”）。

视频/实时滤镜（高级版）

调用摄像头，实时套滤镜（类似 Snapchat/FaceApp 的 live 模式）。

对短视频片段进行处理，生成 “婴儿化/可爱化”视频。

个性化定制

用户可选择特定风格（比如 “卡通萌系 / 手绘风 / 韩漫风 / 迪士尼风格”）。

提供额外的滤镜组合（美颜 + 减龄 + 卡通）。