# Money Tracker — Project Development Plan

> **Platform:** Next.js 16 (mobile-first web app)
> **Methodology:** Agile — 1-week sprints
> **Data strategy:** Zustand + localStorage (Phase 1) → MongoDB migration (future)

---

## Vision

A personal finance tracker that feels native on mobile. The single killer feature is the **"Safe to Spend Today"** number on the home screen — one glance tells the user exactly how much they can spend without breaking their monthly budget.

---

## UX Principles (Non-Negotiable)

- **Color-coded status everywhere** — Green = safe/income, Amber = warning, Red = over budget. No reading required.
- **Bottom nav, 4 tabs max** — Home · Transactions · Budget · Reports. No hidden drawers.
- **Quick-add in ≤ 3 taps** — Floating action button → Amount → Category → Done.
- **Dark mode from day one** — Expected on finance apps.
- **Empty states with guidance** — Never show a blank screen; guide the user to add their first wallet, transaction, or budget.
- **Micro-animations for delight** — Celebrate milestones (savings goal reached, under budget).

---

## Phase 1 — MVP Core (7 × 1-week sprints)

### Sprint 1 — Mobile-First Foundation
**Status:** `[x] Complete`

**Goal:** Make the app feel native on mobile. Replace the desktop sidebar with a bottom navigation bar. Wire the Demo button.

| Task | File(s) |
|---|---|
| Demo button → `/auth/signup` | `src/app/page.tsx` |
| Bottom nav (4 tabs) replacing sidebar | `navigation.tsx` (full rewrite) |
| Dashboard layout restructure | `src/app/dashboard/layout.tsx` |
| Sticky mobile header (logo + avatar) | `navigation.tsx` |
| Responsive: bottom nav (sm) + sidebar (lg) | `navigation.tsx` |

**Definition of Done:**
- Mobile viewport (375px) shows bottom tabs, no sidebar
- Desktop (1024px+) shows sidebar
- Demo button navigates to sign-up page
- `npm run build` passes, zero lint errors

---

### Sprint 2 — Dashboard Overhaul
**Status:** `[x] Complete`

**Goal:** Rebuild the dashboard around the killer features.

| Task | File(s) |
|---|---|
| "Safe to Spend Today" hero number | `src/components/SafeToSpend.tsx` |
| Monthly budget ring (SVG circular progress) | `src/components/BudgetRing.tsx` |
| Income vs Expense bar (current month) | `src/app/dashboard/page.tsx` |
| Top 3 categories with mini progress bars | `src/components/CategoryProgressBar.tsx` |
| Recent 5 transactions slim list | `src/app/dashboard/page.tsx` |
| Analytics API: add `safeToSpend`, `budgetProgress` | `src/app/api/analytics/route.ts` |

**Safe to Spend formula:**
```
safeToSpend = (totalMonthlyBudget - totalSpentThisMonth) / remainingDaysInMonth
```
Falls back to income-based estimate if no budget is set.

**Budget ring color logic:**
- < 70% spent → Green
- 70–90% spent → Amber
- > 90% spent → Red

**Definition of Done:**
- Dashboard shows all 5 widgets above the fold on a 375px screen
- Safe to Spend updates dynamically with real analytics data
- Budget ring animates on load

---

### Sprint 3 — Transaction Management
**Status:** `[x] Complete`

**Goal:** Full transaction CRUD. Quick-add in ≤ 3 taps.

| Task | File(s) |
|---|---|
| Transactions page with filters | `src/app/dashboard/transactions/page.tsx` |
| Floating Action Button (FAB) | `src/components/FAB.tsx` |
| Quick-add modal (Amount → Category → Done) | `src/components/QuickAddModal.tsx` |
| Paginated list grouped by date | `src/components/TransactionList.tsx` |
| Swipe-to-delete (CSS + touch events) | `src/components/TransactionList.tsx` |
| Edit transaction (tap → pre-filled modal) | `src/components/QuickAddModal.tsx` |
| DELETE `/api/transactions/[id]` route | `src/app/api/transactions/[id]/route.ts` |
| PUT `/api/transactions/[id]` route | `src/app/api/transactions/[id]/route.ts` |

**Definition of Done:**
- User can add a transaction in 3 taps from any dashboard page
- Transactions page shows paginated, date-grouped list
- Swipe left reveals delete; tap opens edit modal
- All operations persist via existing MongoDB API

---

### Sprint 4 — Wallets / Accounts
**Status:** `[x] Complete`

**Goal:** Multiple wallets with manual balance input and transfers.

> **Data storage:** Zustand store persisted to `localStorage` (`'mt-wallets'`).
> No new API routes this sprint — database migration is a future phase.

| Task | File(s) |
|---|---|
| Zustand wallet store | `src/store/walletStore.ts` |
| Wallets page (card grid) | `src/app/dashboard/wallets/page.tsx` |
| Add/Edit Wallet modal | `src/components/AddWalletModal.tsx` |
| Transfer between wallets modal | `src/components/TransferModal.tsx` |
| Wallet card component | `src/components/WalletCard.tsx` |
| Dashboard: total balance from wallet store | `src/app/dashboard/page.tsx` |
| Quick-add modal: wallet selector | `src/components/QuickAddModal.tsx` |

**Wallet types:** Cash · Bank · Credit Card · E-Wallet (GrabPay, TrueMoney, etc.)

**Wallet store shape:**
```ts
interface Wallet {
  id: string        // uuid
  name: string
  type: 'cash' | 'bank' | 'credit' | 'ewallet'
  balance: number
  currency: string
  icon: string      // lucide icon name
  color: string     // hex
}
```

**Definition of Done:**
- User can create multiple wallets and see total balance on dashboard
- Transfer moves balance from one wallet to another
- Data persists across page refreshes (localStorage)

---

### Sprint 5 — Budget Planner
**Status:** `[x] Complete`

**Goal:** Per-category monthly budgets with visual progress and overspend alerts.

> **Data storage:** Zustand store persisted to `localStorage` (`'mt-budgets'`).
> Spent amounts are read from the existing `/api/analytics` endpoint.

| Task | File(s) |
|---|---|
| Zustand budget store | `src/store/budgetStore.ts` |
| Budget page (category budget cards) | `src/app/dashboard/budget/page.tsx` |
| Budget card (progress bar, color thresholds) | `src/components/BudgetCard.tsx` |
| Set/Edit budget modal | `src/components/SetBudgetModal.tsx` |
| Overspend Sonner toast on quick-add | `src/components/QuickAddModal.tsx` |
| Safe to Spend uses budget store total | `src/app/api/analytics/route.ts` or client-side calc |

**Budget store shape:**
```ts
interface Budget {
  id: string
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  amount: number
  period: 'monthly' | 'weekly' | 'yearly'
  carryOver: boolean
}
```

**Progress bar color thresholds:**
- `spent / budget < 0.70` → Green
- `spent / budget 0.70–0.90` → Amber
- `spent / budget > 0.90` → Red

**Definition of Done:**
- User can set a monthly budget per category
- Cards show real-time spent vs budget with correct colors
- Toast fires on overspend (using Sonner, already installed)
- Data persists across refreshes

---

### Sprint 6 — Reports & Analytics
**Status:** `[x] Complete`

**Goal:** Visual analytics page with charts (Recharts already installed).

| Task | File(s) |
|---|---|
| Reports page with period switcher (W/M/Y) | `src/app/dashboard/reports/page.tsx` |
| Donut/pie chart — spending by category | `src/components/DonutChart.tsx` |
| Line chart — income vs expense (6 months) | `src/components/TrendLineChart.tsx` |
| Calendar heatmap — daily spending intensity | `src/components/SpendingCalendar.tsx` |
| Analytics API: 6-month trend + calendar data | `src/app/api/analytics/route.ts` |
| Summary nudges ("23% more on dining this month") | `src/app/dashboard/reports/page.tsx` |

**Definition of Done:**
- Reports page renders all 3 charts without hydration errors
- Period switcher (Week/Month/Year) updates all charts
- Calendar heatmap shows correct intensity per day

---

### Sprint 7 — Polish, Dark Mode & Settings
**Status:** `[ ] Pending`

**Goal:** Production-ready finish. Dark mode, empty states, micro-animations, settings, PWA.

| Task | File(s) |
|---|---|
| Dark mode (next-themes ThemeProvider) | `src/app/layout.tsx`, `src/app/globals.css` |
| Theme toggle in mobile header | `navigation.tsx` |
| Settings page (display name, currency, sign out) | `src/app/dashboard/settings/page.tsx` |
| Settings API (PUT currency/username) | `src/app/api/user/settings/route.ts` |
| Empty states on all data-empty pages | Per page component |
| Category management in settings | `src/app/dashboard/settings/page.tsx` |
| Micro-animations (number counter, budget celebration) | `src/components/SafeToSpend.tsx`, etc. |
| PWA manifest + meta tags | `public/manifest.json`, `src/app/layout.tsx` |

**Definition of Done:**
- Dark/light mode toggle works and persists
- Settings saves currency preference to user profile
- All pages have meaningful empty states
- PWA: "Add to Home Screen" works on mobile

---

## Phase 2 — Smart Layer (Post-Phase 1)

> Planned for 3–6 months post-launch. Sprints to be defined.

- **Savings Goals** — Target amount + deadline, visual progress, milestone celebrations
- **Bill & Subscription Tracker** — Recurring bills timeline, 3-day-before alerts
- **Cash Flow Forecast** — Project next 30-day balance from recurring income + bills
- **Spending Insights** — Biggest spending day, category vs last month nudges
- **Database migration** — Move Zustand wallet + budget stores to MongoDB

---

## Phase 3 — Power Features (6–12 months)

> Planned after Phase 2 stabilizes.

- AI Smart Categorization (merchant name pattern matching)
- Debt Tracker (snowball/avalanche method)
- Net Worth Tracker (assets - liabilities, monthly snapshot)
- Family/Couple Shared Budget
- Export (PDF monthly report, CSV)
- Widgets (iOS/Android home screen via PWA)

---

## Tech Stack Reference

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 + Shadcn UI (new-york) |
| Database | MongoDB 7 (`money_tracker` db) |
| Auth | NextAuth 5 (JWT, Google OAuth + Credentials) |
| Client state | Zustand 5 + `persist` middleware |
| Charts | Recharts 3 |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Toasts | Sonner |
| Theme | next-themes |
| Path alias | `@/*` → `./src/*` |

---

## Commands

```bash
npm run dev                                    # Start dev server
npm run build                                  # Production build
npx eslint "**/*.{tsx,jsx}" --quiet           # Lint check (run after every sprint)
```

---

## Data Layer Rule (Non-Negotiable)

**All data reads and writes must go through `src/lib/data.ts`.** No page or component may call `fetch('/api/*')` directly.

### Current backend: `sessionStorage`
The app runs without any environment variables. `src/lib/data.ts` reads/writes from `sessionStorage` so every feature works immediately in the browser with zero setup.

### How to migrate a function to the real API
1. Open `src/lib/data.ts`
2. Find the function (each one has a `// MIGRATE:` comment with the exact API route)
3. Replace the `sessionStorage` body with the `fetch()` call shown in the comment
4. The return type stays identical — callers need no changes

```ts
// BEFORE (sessionStorage)
export function getTransactions(): StoredTransaction[] {
  return read<StoredTransaction[]>(KEYS.transactions, [])
}

// AFTER (API)
export async function getTransactions(): Promise<StoredTransaction[]> {
  return fetch('/api/transactions').then(r => r.json())
}
```

### Storage keys (`sessionStorage`)
| Key | Contents |
|---|---|
| `mt-local-users` | Registered accounts (auth) |
| `mt-transactions` | All transactions |
| `mt-categories` | User categories (seeded with defaults on first load) |

---

## Definition of Done (Global)

Every sprint is complete when:
1. Feature works on mobile viewport (375px) in DevTools
2. `npx eslint "**/*.{tsx,jsx}" --quiet` — zero errors
3. `npm run build` — passes with no errors
4. No TypeScript errors (`tsc --noEmit`)
5. All data operations go through `src/lib/data.ts` (no raw `fetch('/api/*')` in components)
