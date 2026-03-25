# Workspace

## Overview

pnpm workspace monorepo using TypeScript. **Sumo Guard** - a health analysis app that tracks daily habits and sleep to predict future disease risks.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, TailwindCSS, Recharts, react-hook-form, framer-motion

## App: Sumo Guard

A health guardian app that:
- Tracks daily sleep logs (bedtime, wake time, quality)
- Tracks daily habits (exercise, water, diet, stress, smoking, alcohol, meditation)
- Analyzes patterns to predict future disease risks (cardiovascular, diabetes, sleep disorders, mental health, hypertension)
- Shows an overall health score and personalized recommendations

### Pages
1. **Dashboard** (`/`) - Health score, sleep trends, top disease risks, quick stats
2. **Sleep Logs** (`/sleep`) - Log and view sleep entries
3. **Daily Habits** (`/habits`) - Log and view daily habit entries
4. **Predictions** (`/predictions`) - Disease risk analysis and recommendations
5. **Profile** (`/profile`) - User profile (age, weight, height, family history)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── sumo-guard/         # React + Vite frontend (Sumo Guard app)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Database Schema

- `sleep_logs` - Sleep tracking entries
- `habit_logs` - Daily habit tracking
- `user_profile` - Single user profile record

## API Routes

- `GET/POST /api/sleep` - Sleep log CRUD
- `DELETE /api/sleep/:id` - Delete sleep log
- `GET/POST /api/habits` - Habit log CRUD
- `DELETE /api/habits/:id` - Delete habit log
- `GET /api/predictions` - Disease risk predictions
- `GET /api/dashboard` - Dashboard summary
- `GET/PUT /api/profile` - User profile

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

### `artifacts/sumo-guard` (`@workspace/sumo-guard`)

React + Vite frontend. Uses `@workspace/api-client-react` for generated React Query hooks.

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`).

Run codegen: `pnpm --filter @workspace/api-spec run codegen`
