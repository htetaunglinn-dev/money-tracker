# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server (http://localhost:3000)
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
npx eslint "**/*.{tsx,jsx}" --quiet  # Lint after implementing changes
```

## Environment Variables

Required in `.env.local`:
```
MONGODB_URI
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
NEXTAUTH_SECRET
```

## Architecture

**Stack**: Next.js 16 (App Router) + React 19 + TypeScript + MongoDB + NextAuth 5 + Tailwind CSS v4 + Shadcn UI

### Path Alias
`@/*` maps to `./src/*`

### Route Structure
- Public: `/`, `/auth/signin`, `/auth/signup`
- Protected: `/dashboard` (requires session)
- API: `/api/auth/*`, `/api/transactions`, `/api/categories`, `/api/analytics`
- Wallets, budgets, and savings goals are **localStorage-only** (Zustand stores) — no DB routes for these

### Authentication
Configured in [src/auth.ts](src/auth.ts) — NextAuth 5 with JWT sessions. Supports Google OAuth and email/password (bcryptjs). Session callbacks inject `user.id` into the JWT. The sign-in callback auto-creates Google users in MongoDB.

### Database
MongoDB connection uses a singleton + global cache pattern (dev-safe) in [src/mongodb.ts](src/mongodb.ts). Database: `money_tracker`. Collections: `users`, `categories`, `transactions`, `budgets`. Data models are defined in [models.ts](models.ts) (root) and [src/models.ts](src/models.ts).

### API Routes
All API routes validate the NextAuth session server-side before any DB operation. The analytics route (`/api/analytics`) uses MongoDB aggregation pipelines. Transactions support filtering by type, category, date range, and pagination.

### UI Components
Shadcn UI components live in [src/components/ui/](src/components/ui/) (new-york style, Lucide icons). Global CSS custom properties for brand colors are in [src/app/globals.css](src/app/globals.css):
- `--color-money-green`: `#5DD62C`
- `--color-money-dark`: `#202020`

### State Management
Zustand for client-side global state. NextAuth session for auth state. Data fetching via `useEffect` + `fetch` on client components.

Zustand stores (all persisted to localStorage):
- `src/store/walletStore.ts` — wallets (`mt-wallets`). `WALLET_TYPE_META` maps type → icon/color.
- `src/store/budgetStore.ts` — budgets (`mt-budgets`)
- `src/store/savingsStore.ts` — savings goals (`mt-savings`). `addContribution` returns the updated goal for inline milestone checks.
- `src/store/settingsStore.ts` — display name, currency (`mt-settings`). `CURRENCY_OPTIONS` array exported.

### Forms
React Hook Form + Zod + `@hookform/resolvers` throughout. Zod schemas serve as the single source of validation truth.

### ESLint Gotchas

These custom rules will fail the lint check — avoid them:

- **No `any` types** — use `Record<string, unknown>` for dynamic MongoDB filters
- **Icon pattern** — never `const Icon = getIcon(x)` inside a component body (violates `react-hooks/static-components`). Use `<DynamicIcon name={x.icon} />` from `@/lib/icons` instead.
- **`Date.now()` in render** — blocked by `react-hooks/purity`. Use a module-level `const NOW = Date.now()` instead.
- **Recharts** — import chart components with `dynamic(..., { ssr: false })` from the page to avoid SSR/hydration issues.
- **No `setState` in effects** — `react-hooks/set-state-in-effect` blocks synchronous setState inside `useEffect`. Use lazy initializers (`useState(getInitialValue)`) to read from sessionStorage safely.
- **Brand colors** — use canonical Tailwind classes (`bg-money-dark`, `bg-money-green`, `text-money-light`, `border-money-green/10`) not raw hex values. Defined in `src/app/globals.css` via `@theme`.
- **API auth pattern** — use `import { auth } from "@/auth"` + `const session = await auth()`, NOT `getServerSession(authOptions)`.
