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

### Forms
React Hook Form + Zod + `@hookform/resolvers` throughout. Zod schemas serve as the single source of validation truth.
