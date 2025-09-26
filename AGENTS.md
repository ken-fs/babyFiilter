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
