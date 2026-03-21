# UI Improvement Sprints

## How to Use
Work through each sprint in order. Check off each task as you complete it. Run the lint + build verification at the end of each sprint before moving to the next.

---

## Sprint A — Brand & Theme Consistency

> Fix the most critical issues: auth pages that look completely different from the app, raw hex colors on the landing page, and text that breaks in light theme.

### A1. Rebrand Auth Pages
**Files**: `src/app/auth/signin/page.tsx`, `src/app/auth/signup/page.tsx`

- [x] Replace `bg-gradient-to-br from-emerald-50 to-blue-50` background with dark brand background (`bg-money-black` or `hero-gradient`)
- [x] Replace all `text-emerald-600` → `text-money-green`
- [x] Replace `Wallet` icon color from `text-emerald-600` → `text-money-green`
- [x] Add MoneyTracker logo header above card (Wallet icon + "Money**Tracker**" brand text)
- [x] Fix "Or continue with" divider: `bg-white` → `bg-card` (signin page only)
- [x] Style the Sign In / Create Account submit buttons with `bg-money-green text-money-black`
- [x] Make the card itself dark-themed (dark background, matching app modals)

### A2. Landing Page — Replace Raw Hex Colors
**File**: `src/app/page.tsx`

- [x] `text-[#5DD62C]` → `text-money-green` (all occurrences)
- [x] `text-[#F8F8F8]` → `text-money-light` (all occurrences)
- [x] `text-[#A0A0A0]` → `text-muted-foreground` (all occurrences)
- [x] `text-[#0F0F0F]` → `text-money-black` (all occurrences)
- [x] `bg-[#5DD62C]` → `bg-money-green` (all occurrences)
- [x] `bg-[#202020]` → `bg-money-dark` (all occurrences)
- [x] `bg-[#337418]` / `bg-[#5DD62C]/...` tints → `bg-money-green-dark` / `bg-money-green/...`
- [x] `border-[#5DD62C]` → `border-money-green` (all occurrences)
- [x] `ring-[#5DD62C]` → `ring-money-green` (MiniCalendar)
- [x] Replace inline `style={{ color: feature.color }}` on feature cards with conditional Tailwind classes
- [x] Replace `style={{ backgroundColor: ... }}` gradient orbs with Tailwind classes where possible

### A3. Fix `text-money-light` → `text-foreground` for Light Theme
> `text-money-light` is always `#F8F8F8` — it never adapts. Use `text-foreground` for headings and labels that should respond to theme changes.

- [x] `src/app/dashboard/reports/page.tsx` — replace `text-money-light` with `text-foreground` on h1, h2 headings
- [x] `src/app/dashboard/budget/page.tsx` — replace `text-money-light` with `text-foreground` on headings and labels
- [x] `src/app/dashboard/page.tsx` — replace `text-money-light` on savings goal name (line ~332)
- [x] `src/components/BudgetCard.tsx` — replace `text-money-light` with `text-foreground`
- [x] `src/components/SavingsGoalCard.tsx` — replace `text-money-light` with `text-foreground`
- [x] `src/components/DonutChart.tsx` — replace `text-money-light` with `text-foreground`
- [x] `src/components/layout/navigation.tsx` — replace `hover:text-money-light` with `hover:text-foreground`

### Sprint A Verification
- [x] `npx eslint "**/*.{tsx,jsx}" --quiet 2>&1` — must pass with no errors
- [ ] `npm run build` — must compile successfully
- [ ] Open app in browser, switch between dark/light theme — all text readable in both modes
- [ ] Auth pages look consistent with the rest of the app

---

## Sprint B — UX Polish

> Fix usability gaps: missing page headers, inaccessible mobile interactions, wrong currency formatting.

### B1. Fix Wallets Page Hardcoded USD Currency
**File**: `src/app/dashboard/wallets/page.tsx`

- [x] Remove local `fmtCurrency` function (lines 12–13, hardcoded USD)
- [x] Import `useFmtCurrency` from `@/store/settingsStore`
- [x] Call `const fmtCurrency = useFmtCurrency()` inside the component
- [x] Replace all `fmtCurrency(...)` calls — they now use user's selected currency

### B2. Add Transactions Page Header
**File**: `src/app/dashboard/transactions/page.tsx`

- [x] Add a header block before the summary cards:
  ```tsx
  <div className="flex items-center justify-between pt-1 shrink-0">
    <div>
      <h1 className="text-lg font-bold tracking-tight text-foreground">Transactions</h1>
      <p className="text-xs text-muted-foreground">{allTransactions.length} transactions</p>
    </div>
  </div>
  ```

### B3. Style "Load More" as a Proper Button
**File**: `src/app/dashboard/transactions/page.tsx`

- [x] Import `Button` from `@/components/ui/button` and `ChevronDown` from `lucide-react`
- [x] Replace the plain `<button>` Load More with:
  ```tsx
  <Button variant="outline" onClick={() => setPage((p) => p + 1)}
    className="w-full gap-2 border-money-green/20 text-muted-foreground hover:text-foreground">
    <ChevronDown className="h-4 w-4" />
    Load more ({filtered.length - paginated.length} remaining)
  </Button>
  ```

### B4. Fix Settings Category Actions for Mobile
**File**: `src/app/dashboard/settings/page.tsx` — `CategoryRow` component

- [x] Change `opacity-0 group-hover:opacity-100` → `opacity-100 sm:opacity-0 sm:group-hover:opacity-100`
- [x] This makes edit/delete buttons always visible on mobile (touch devices have no hover)

### B5. Improve Icon Picker Layout in Settings Dialog
**File**: `src/app/dashboard/settings/page.tsx`

- [x] Change `grid-cols-9` → `grid-cols-7` (less cramped)
- [x] Increase icon button size from `w-8 h-8` → `w-9 h-9`
- [x] Increase scrollable area from `max-h-36` → `max-h-48`

### Sprint B Verification
- [x] `npx eslint "**/*.{tsx,jsx}" --quiet 2>&1` — must pass
- [ ] `npm run build` — must compile
- [ ] Open Wallets page — currency matches Settings preference
- [ ] Open Transactions page — header "Transactions" visible at top
- [ ] Open Settings on mobile viewport (375px) — edit/delete icons visible without hover
- [ ] Open Settings category dialog — icon grid is less cramped, scrolls comfortably

---

## Sprint C — Enhancements

> Nice-to-have improvements: mobile hero visuals, theme-aware modals, skeleton loading states.

### C1. Add Mobile Hero Visuals on Landing Page
**File**: `src/app/page.tsx`

- [x] The floating cards section is `hidden lg:block` — mobile sees nothing
- [x] Add a `block lg:hidden` section below the CTA buttons with 2–3 horizontally-scrollable mini stat cards:
  - Monthly Savings card (TrendingUp icon + `$2,450` + "+12.5%")
  - Budget Used card (PieChart icon + progress bar at 68%)
  - Weekly Savings card (Zap icon + "+$340 saved")
- [x] Use `flex gap-3 overflow-x-auto pb-2` for horizontal scroll, each card `glass-card rounded-2xl p-4 shrink-0 w-44`

### C2. Make Modals Theme-Aware
**Files** (all 6 modal components):
- `src/components/QuickAddModal.tsx`
- `src/components/AddWalletModal.tsx`
- `src/components/TransferModal.tsx`
- `src/components/SetBudgetModal.tsx`
- `src/components/AddGoalModal.tsx`
- `src/components/ContributeModal.tsx`

For each modal:
- [x] `QuickAddModal.tsx` — replace `bg-[#1a1a1a]` → `bg-card`, `text-money-light` → `text-card-foreground`, `border-white/10` → `border-border`, `bg-white/5` → `bg-muted`
- [x] `AddWalletModal.tsx` — same replacements
- [x] `TransferModal.tsx` — same replacements
- [x] `SetBudgetModal.tsx` — same replacements
- [x] `AddGoalModal.tsx` — same replacements
- [x] `ContributeModal.tsx` — same replacements

### C3. Add Skeleton Loading States
**Files**: `src/app/dashboard/page.tsx`, `src/app/dashboard/transactions/page.tsx`, `src/app/dashboard/reports/page.tsx`

- [x] Import `Skeleton` from `@/components/ui/skeleton` in each page
- [x] Dashboard: show skeleton cards while `analytics` data is initializing (check if `recentTransactions.length === 0 && wallets.length === 0` as proxy — or add a dedicated `isLoading` state initialized via lazy function)
- [x] Transactions: show 5 skeleton rows when `allTransactions.length === 0` on first render
- [x] Reports: show skeleton summary strip + skeleton chart area while chart loads (charts already have `loading: () => <div className="animate-pulse ...">` — extend this pattern to the summary cards)

> **ESLint note**: Do NOT use `setState` inside `useEffect` for loading states — violates `react-hooks/set-state-in-effect`. Use lazy initializers or derive loading from existing data.

### Sprint C Verification
- [x] `npx eslint "**/*.{tsx,jsx}" --quiet 2>&1` — must pass
- [x] `npm run build` — must compile
- [ ] Open landing page on mobile (375px) — mini stat cards visible and horizontally scrollable
- [ ] Open any modal in light theme — modal background is light, not forced dark
- [ ] Open dashboard with no data — skeleton placeholders visible before "No transactions yet" state

---

## Sprint D — Micro-interactions & Polish

> Fix misleading empty states, add scroll hints, improve visual feedback on interactive elements, and make completed savings goals feel rewarding.

### D1. QuickAddModal — Category Grid Scroll Fade
**File**: `src/components/QuickAddModal.tsx`

- [x] Wrap the category grid in a `relative` container
- [x] Add a `pointer-events-none` fade overlay at the bottom (`bg-linear-to-t from-card to-transparent h-8`) that renders when `filteredCategories.length > 6`
- [x] Signals to users that more categories exist below the visible area

### D2. BudgetCard — Progress Track Color Transition
**File**: `src/components/BudgetCard.tsx`

- [x] Add `transition-colors duration-500` to the track `<div>` (background color was animating abruptly while the fill bar smoothly animated)
- [x] Both track (`bg-money-green/20` → `bg-amber-500/20` → `bg-red-500/20`) and fill now transition together

### D3. SavingsGoalCard — Completed State Badge
**File**: `src/components/SavingsGoalCard.tsx`

- [x] Import `Trophy` from `lucide-react`
- [x] Replace plain `text-[10px]` "Goal Reached" text with a proper pill badge: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider`
- [x] Add `<Trophy className="h-2.5 w-2.5" />` icon inside the badge

### D4. Reports — Period Switcher Hover Feedback
**File**: `src/app/dashboard/reports/page.tsx`

- [x] Change `transition-colors` → `transition-all` on period switcher buttons
- [x] Active button: add `scale-105` to visually indicate selection
- [x] Inactive buttons: add `hover:scale-105 active:scale-95` for tactile feel
- [x] Fix hover text: `hover:text-money-light` → `hover:text-foreground` (theme-aware)

### D5. Dashboard — Fix Misleading Skeleton on Empty State
**File**: `src/app/dashboard/page.tsx`

- [x] Remove skeleton rows that showed when `wallets.length === 0 && recentTransactions.length === 0` (localStorage reads are synchronous — there is no loading state to represent)
- [x] Unified into a single empty state: shows "No transactions yet" always when `recentTransactions.length === 0`
- [x] Contextual sub-message: "Create a wallet first…" if no wallets, or "Tap + to add…" if wallets exist
- [x] Remove unused `Skeleton` import from dashboard page

### D6. Transactions — Filter Tab Hover Feedback
**File**: `src/app/dashboard/transactions/page.tsx`

- [x] Active tab: add `scale-105` to match period switcher pattern
- [x] Inactive tabs: add `hover:text-foreground hover:scale-105 active:scale-95`

### Sprint D Verification
- [x] `npx eslint "**/*.{tsx,jsx}" --quiet 2>&1` — must pass with no errors
- [x] `npm run build` — must compile successfully
- [ ] Open QuickAddModal with many categories — bottom fade hint visible when scrollable
- [ ] Open Budget page, change spending — progress bar track and fill both transition smoothly
- [ ] Open Budget page, complete a savings goal — "Goal Reached" badge visible with trophy icon
- [ ] Open Reports page — period buttons feel interactive (scale on hover/tap)
- [ ] Open Dashboard as new user (no data) — contextual empty state, no skeleton pulse
