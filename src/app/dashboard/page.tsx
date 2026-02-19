"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { getAnalytics } from "@/lib/data"
import { SafeToSpend } from "@/components/SafeToSpend"
import { BudgetRing } from "@/components/BudgetRing"
import { CategoryProgressBar } from "@/components/CategoryProgressBar"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)

const fmtDate = (dateString: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(dateString)
  )

export default function DashboardPage() {
  const { data: session } = useSession()

  const [analytics] = useState(() => getAnalytics())
  const { summary, expensesByCategory, recentTransactions } = analytics

  const barMax = Math.max(summary.totalIncome, summary.totalExpense, 1)
  const incomeBarPct = (summary.totalIncome / barMax) * 100
  const expenseBarPct = (summary.totalExpense / barMax) * 100

  const firstName = session?.user?.name?.split(" ")[0] ?? "there"
  const balancePositive = summary.balance >= 0

  return (
    /*
      Mobile  : stacked, natural scroll
      Desktop : 2-col, locked to 100vh — p-6 (1.5rem) top+bottom = 3rem offset
    */
    <div className="flex flex-col gap-4 max-w-lg mx-auto lg:max-w-none lg:h-[calc(100vh-3rem)]">

      {/* ── Greeting ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-1 shrink-0">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            Hey, {firstName} 👋
          </h1>
          <p className="text-xs text-muted-foreground">{summary.period}</p>
        </div>
        <div className={`rounded-full px-3 py-1 text-xs font-semibold border ${
          balancePositive
            ? "bg-money-green/10 text-money-green border-money-green/20"
            : "bg-red-400/10 text-red-400 border-red-400/20"
        }`}>
          {balancePositive ? "+" : ""}{fmtCurrency(summary.balance)}
        </div>
      </div>

      {/* ── Main 2-column grid ────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:flex-1 lg:min-h-0">

        {/* ── Left column ───────────────────────────────────── */}
        <div className="flex flex-col gap-4 lg:w-1/2 lg:min-h-0">

          {/* Safe to Spend hero */}
          <SafeToSpend data={analytics} />

          {/* Monthly Overview — fills remaining left height on desktop */}
          <Card className="py-0 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
            <CardContent className="p-4 flex-1 flex flex-col">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground shrink-0">
                Monthly Overview
              </p>

              <div className="flex items-center gap-5 mt-4 flex-1 min-h-0">
                {/* amCharts5 donut ring */}
                <BudgetRing
                  progress={summary.budgetProgress}
                  income={summary.totalIncome}
                  expense={summary.totalExpense}
                />

                {/* Income / Expense / Balance */}
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Income */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-money-green" />
                        <span className="text-[11px] text-muted-foreground">Income</span>
                      </div>
                      <span className="text-sm font-bold text-money-green tabular-nums">
                        {fmtCurrency(summary.totalIncome)}
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-white/8 overflow-hidden">
                      <div
                        className="h-full bg-money-green rounded-full transition-all duration-700"
                        style={{ width: `${incomeBarPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Expenses */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                        <span className="text-[11px] text-muted-foreground">Expenses</span>
                      </div>
                      <span className="text-sm font-bold text-red-400 tabular-nums">
                        {fmtCurrency(summary.totalExpense)}
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-white/8 overflow-hidden">
                      <div
                        className="h-full bg-red-400 rounded-full transition-all duration-700"
                        style={{ width: `${expenseBarPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Balance */}
                  <div className="pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[11px] text-muted-foreground">Balance</span>
                      </div>
                      <span className={`text-sm font-bold tabular-nums ${balancePositive ? "text-money-green" : "text-red-400"}`}>
                        {balancePositive ? "+" : ""}{fmtCurrency(summary.balance)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right column ──────────────────────────────────── */}
        <div className="flex flex-col gap-4 lg:w-1/2 lg:min-h-0">

          {/* Top Categories */}
          <Card className="py-0">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-4">
                Top Categories
              </p>
              <CategoryProgressBar categories={expensesByCategory} />
            </CardContent>
          </Card>

          {/* Recent Transactions — fills remaining right height on desktop */}
          <Card className="py-0 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
            <CardContent className="p-4 flex-1 flex flex-col">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground shrink-0">
                Recent Transactions
              </p>

              <div className="mt-4 space-y-4 lg:flex-1 lg:overflow-y-auto lg:min-h-0">
                {recentTransactions.slice(0, 5).map((tx) => (
                  <div key={tx._id} className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold"
                      style={{
                        backgroundColor: `${tx.category.color}1a`,
                        color: tx.category.color,
                        border: `1px solid ${tx.category.color}33`,
                      }}
                    >
                      {tx.category.name.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.category.name} · {fmtDate(tx.date)}
                      </p>
                    </div>

                    <span
                      className={`text-sm font-semibold shrink-0 tabular-nums ${
                        tx.type === "income" ? "text-money-green" : "text-red-400"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "−"}
                      {fmtCurrency(tx.amount)}
                    </span>
                  </div>
                ))}

                {recentTransactions.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">No transactions yet</p>
                    <p className="text-xs text-muted-foreground mt-1 opacity-60">
                      Add your first transaction to get started
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
