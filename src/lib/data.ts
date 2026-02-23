import { useBudgetStore } from "@/store/budgetStore"

/**
 * DATA LAYER
 *
 * All data operations go through this file. Currently backed by sessionStorage
 * so the app runs without any backend configuration.
 *
 * HOW TO MIGRATE TO API:
 * Replace the body of each function with a fetch() to the matching API route.
 * The return types and shapes are intentionally identical to what the API routes
 * already return, so callers need zero changes.
 *
 * Example:
 *   // sessionStorage (current)
 *   export function getTransactions() { return JSON.parse(sessionStorage.getItem(...)) }
 *
 *   // API (future)
 *   export async function getTransactions() { return fetch('/api/transactions').then(r => r.json()) }
 */

// ─── Storage keys ────────────────────────────────────────────────────────────

const KEYS = {
  transactions: "mt-transactions",
  categories: "mt-categories",
} as const

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StoredCategory {
  id: string
  name: string
  icon: string
  color: string
  type: "income" | "expense"
}

export interface StoredTransaction {
  id: string
  amount: number
  description: string
  type: "income" | "expense"
  categoryId: string
  date: string // ISO string
  walletId?: string
  location?: string
  tags?: string[]
}

export type ReportPeriod = "week" | "month" | "year"

export interface ReportsData {
  summary: {
    totalIncome: number
    totalExpense: number
    balance: number
    label: string
  }
  expensesByCategory: Array<{
    id: string
    name: string
    icon: string
    color: string
    total: number
    percentage: number
  }>
  monthlyTrend: Array<{
    month: string
    income: number
    expense: number
  }>
  calendarData: Array<{
    date: string
    total: number
  }>
  nudges: Array<{
    text: string
    direction: "up" | "down"
  }>
}

export interface AnalyticsData {
  summary: {
    totalIncome: number
    totalExpense: number
    balance: number
    period: string
    safeToSpend: number      // how much can be spent today without breaking monthly budget
    budgetProgress: number   // 0–1 ratio (expense / income, capped at 1)
    remainingDays: number    // days left in the current month including today
  }
  expensesByCategory: Array<{
    _id: string
    name: string
    icon: string
    color: string
    total: number
    count: number
  }>
  recentTransactions: Array<{
    _id: string
    amount: number
    description: string
    type: "income" | "expense"
    date: string
    category: { name: string; icon: string; color: string }
  }>
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function read<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown): void {
  sessionStorage.setItem(key, JSON.stringify(value))
}

// ─── Categories ──────────────────────────────────────────────────────────────
// MIGRATE: replace with fetch('/api/categories')

const DEFAULT_CATEGORIES: StoredCategory[] = [
  { id: "cat-1", name: "Food & Dining",    icon: "utensils",    color: "#ef4444", type: "expense" },
  { id: "cat-2", name: "Transportation",   icon: "car",         color: "#3b82f6", type: "expense" },
  { id: "cat-3", name: "Shopping",         icon: "shopping-bag",color: "#8b5cf6", type: "expense" },
  { id: "cat-4", name: "Entertainment",    icon: "film",        color: "#f59e0b", type: "expense" },
  { id: "cat-5", name: "Bills & Utilities",icon: "receipt",     color: "#ef4444", type: "expense" },
  { id: "cat-6", name: "Healthcare",       icon: "heart",       color: "#ec4899", type: "expense" },
  { id: "cat-7", name: "Salary",           icon: "banknote",    color: "#10b981", type: "income"  },
  { id: "cat-8", name: "Freelance",        icon: "briefcase",   color: "#059669", type: "income"  },
  { id: "cat-9", name: "Investments",      icon: "trending-up", color: "#0d9488", type: "income"  },
]

export function getCategories(): StoredCategory[] {
  // MIGRATE: return fetch('/api/categories').then(r => r.json())
  const stored = read<StoredCategory[]>(KEYS.categories, [])
  if (stored.length === 0) {
    write(KEYS.categories, DEFAULT_CATEGORIES)
    return DEFAULT_CATEGORIES
  }
  return stored
}

export function saveCategories(categories: StoredCategory[]): void {
  // MIGRATE: return fetch('/api/categories', { method: 'PUT', body: JSON.stringify(categories) })
  write(KEYS.categories, categories)
}

export function addCategory(category: Omit<StoredCategory, "id">): StoredCategory {
  // MIGRATE: return fetch('/api/categories', { method: 'POST', body: JSON.stringify(category) }).then(r => r.json())
  const newCat: StoredCategory = { id: `cat-${Date.now()}`, ...category }
  write(KEYS.categories, [...getCategories(), newCat])
  return newCat
}

// ─── Transactions ─────────────────────────────────────────────────────────────
// MIGRATE: replace with fetch('/api/transactions')

export function getTransactions(): StoredTransaction[] {
  // MIGRATE: return fetch('/api/transactions').then(r => r.json())
  return read<StoredTransaction[]>(KEYS.transactions, [])
}

export function addTransaction(tx: Omit<StoredTransaction, "id">): StoredTransaction {
  // MIGRATE: return fetch('/api/transactions', { method: 'POST', body: JSON.stringify(tx) }).then(r => r.json())
  const newTx: StoredTransaction = { id: `tx-${Date.now()}`, ...tx }
  write(KEYS.transactions, [newTx, ...getTransactions()])
  return newTx
}

export function updateTransaction(
  id: string,
  updates: Partial<Omit<StoredTransaction, "id">>
): void {
  // MIGRATE: return fetch(`/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify(updates) })
  const txs = getTransactions().map((tx) => (tx.id === id ? { ...tx, ...updates } : tx))
  write(KEYS.transactions, txs)
}

export function deleteTransaction(id: string): void {
  // MIGRATE: return fetch(`/api/transactions/${id}`, { method: 'DELETE' })
  write(KEYS.transactions, getTransactions().filter((tx) => tx.id !== id))
}

// ─── Analytics (computed from stored data) ───────────────────────────────────
// MIGRATE: replace with fetch('/api/analytics')

export function getAnalytics(): AnalyticsData {
  // MIGRATE: return fetch('/api/analytics').then(r => r.json())
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const catMap = Object.fromEntries(getCategories().map((c) => [c.id, c]))
  const allTxs = getTransactions()
  const monthlyTxs = allTxs.filter((tx) => new Date(tx.date) >= startOfMonth)

  const totalIncome = monthlyTxs
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0)

  const totalExpense = monthlyTxs
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0)

  // Group expenses by category
  const expenseMap = new Map<string, { total: number; count: number }>()
  monthlyTxs
    .filter((tx) => tx.type === "expense")
    .forEach((tx) => {
      const prev = expenseMap.get(tx.categoryId) ?? { total: 0, count: 0 }
      expenseMap.set(tx.categoryId, { total: prev.total + tx.amount, count: prev.count + 1 })
    })

  const expensesByCategory = Array.from(expenseMap.entries())
    .map(([catId, { total, count }]) => {
      const cat = catMap[catId] ?? { name: "Unknown", icon: "circle", color: "#888" }
      return { _id: catId, name: cat.name, icon: cat.icon, color: cat.color, total, count }
    })
    .sort((a, b) => b.total - a.total)

  const recentTransactions = allTxs.slice(0, 10).map((tx) => {
    const cat = catMap[tx.categoryId] ?? { name: "Unknown", icon: "circle", color: "#888" }
    return {
      _id: tx.id,
      amount: tx.amount,
      description: tx.description,
      type: tx.type,
      date: tx.date,
      category: { name: cat.name, icon: cat.icon, color: cat.color },
    }
  })

  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const remainingDays = Math.max(1, lastDayOfMonth.getDate() - now.getDate() + 1)
  // Use budget store total if budgets are set; otherwise fall back to income
  const totalBudgeted = useBudgetStore.getState().getTotalMonthlyBudget()
  const monthlyBudget = totalBudgeted > 0 ? totalBudgeted : totalIncome
  const remaining = monthlyBudget - totalExpense
  const safeToSpend = remaining / remainingDays
  const budgetProgress = totalIncome > 0 ? Math.min(totalExpense / totalIncome, 1) : 0

  return {
    summary: {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      period: `${now.toLocaleString("default", { month: "long" })} ${now.getFullYear()}`,
      safeToSpend,
      budgetProgress,
      remainingDays,
    },
    expensesByCategory,
    recentTransactions,
  }
}

// ─── Reports data (period-aware, includes trend + calendar) ──────────────────
// MIGRATE: replace with fetch('/api/analytics/reports?period=...')

export function getReportsData(period: ReportPeriod): ReportsData {
  const now = new Date()
  const allTxs = getTransactions()
  const catMap = Object.fromEntries(getCategories().map((c) => [c.id, c]))

  // ── Period window ─────────────────────────────────────────────────────────
  let start: Date
  let label: string
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

  if (period === "week") {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0)
    label = "Last 7 Days"
  } else if (period === "year") {
    start = new Date(now.getFullYear(), 0, 1, 0, 0, 0)
    label = `${now.getFullYear()}`
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
    label = `${now.toLocaleString("default", { month: "long" })} ${now.getFullYear()}`
  }

  const periodTxs = allTxs.filter((tx) => {
    const d = new Date(tx.date)
    return d >= start && d <= end
  })

  // ── Summary ───────────────────────────────────────────────────────────────
  const totalIncome = periodTxs
    .filter((tx) => tx.type === "income")
    .reduce((s, tx) => s + tx.amount, 0)
  const totalExpense = periodTxs
    .filter((tx) => tx.type === "expense")
    .reduce((s, tx) => s + tx.amount, 0)

  // ── Expenses by category ──────────────────────────────────────────────────
  const expenseMap = new Map<string, number>()
  periodTxs
    .filter((tx) => tx.type === "expense")
    .forEach((tx) => {
      expenseMap.set(tx.categoryId, (expenseMap.get(tx.categoryId) ?? 0) + tx.amount)
    })
  const expensesByCategory = Array.from(expenseMap.entries())
    .map(([catId, total]) => {
      const cat = catMap[catId] ?? { name: "Unknown", icon: "circle", color: "#888" }
      return {
        id: catId,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        total,
        percentage: totalExpense > 0 ? Math.round((total / totalExpense) * 100) : 0,
      }
    })
    .sort((a, b) => b.total - a.total)

  // ── 6-month income/expense trend ──────────────────────────────────────────
  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const mStart = new Date(d.getFullYear(), d.getMonth(), 1)
    const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
    const mTxs = allTxs.filter((tx) => {
      const txd = new Date(tx.date)
      return txd >= mStart && txd <= mEnd
    })
    return {
      month: d.toLocaleString("default", { month: "short" }),
      income: mTxs.filter((tx) => tx.type === "income").reduce((s, tx) => s + tx.amount, 0),
      expense: mTxs.filter((tx) => tx.type === "expense").reduce((s, tx) => s + tx.amount, 0),
    }
  })

  // ── Calendar heatmap (current month daily expense) ────────────────────────
  const calStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const calEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  const calMap = new Map<string, number>()
  allTxs
    .filter((tx) => {
      const d = new Date(tx.date)
      return d >= calStart && d <= calEnd && tx.type === "expense"
    })
    .forEach((tx) => {
      const day = new Date(tx.date).toISOString().slice(0, 10)
      calMap.set(day, (calMap.get(day) ?? 0) + tx.amount)
    })
  const calendarData = Array.from(calMap.entries())
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // ── Nudges: current month vs previous month by category ───────────────────
  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
  const currStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const prevMap = new Map<string, number>()
  const currMap = new Map<string, number>()
  allTxs
    .filter((tx) => tx.type === "expense")
    .forEach((tx) => {
      const d = new Date(tx.date)
      if (d >= prevStart && d <= prevEnd)
        prevMap.set(tx.categoryId, (prevMap.get(tx.categoryId) ?? 0) + tx.amount)
      if (d >= currStart)
        currMap.set(tx.categoryId, (currMap.get(tx.categoryId) ?? 0) + tx.amount)
    })

  const nudges: ReportsData["nudges"] = []
  currMap.forEach((curr, catId) => {
    const prev = prevMap.get(catId)
    if (prev && prev > 0) {
      const pct = Math.round(((curr - prev) / prev) * 100)
      if (Math.abs(pct) >= 10) {
        const cat = catMap[catId]
        if (cat) {
          nudges.push({
            text: `${Math.abs(pct)}% ${pct > 0 ? "more" : "less"} on ${cat.name} this month`,
            direction: pct > 0 ? "up" : "down",
          })
        }
      }
    }
  })
  nudges.sort((a, b) => parseInt(b.text) - parseInt(a.text))

  return {
    summary: { totalIncome, totalExpense, balance: totalIncome - totalExpense, label },
    expensesByCategory,
    monthlyTrend,
    calendarData,
    nudges,
  }
}
