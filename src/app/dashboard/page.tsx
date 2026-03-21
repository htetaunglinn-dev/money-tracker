"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { GradientCard } from "@/components/ui/gradient-card"
import { getAnalytics } from "@/lib/data"
import { SafeToSpend } from "@/components/SafeToSpend"
import { BudgetRing } from "@/components/BudgetRing"
import { CategoryProgressBar } from "@/components/CategoryProgressBar"
import { TrendingUp, TrendingDown, Minus, Wallet, ChevronRight, Sparkles, PiggyBank } from "lucide-react"
import { useWalletStore } from "@/store/walletStore"
import { useSavingsStore } from "@/store/savingsStore"
import { DynamicIcon } from "@/lib/icons"
import { useFmtCurrency } from "@/store/settingsStore"

const fmtDate = (dateString: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(dateString)
  )

export default function DashboardPage() {
  const { data: session } = useSession()
  const fmtCurrency = useFmtCurrency()
  const wallets = useWalletStore((s) => s.wallets)
  const getTotalBalance = useWalletStore((s) => s.getTotalBalance)

  const [analytics, setAnalytics] = useState(getAnalytics)

  useEffect(() => {
    const refresh = () => setAnalytics(getAnalytics())
    window.addEventListener("mt:transactions-changed", refresh)
    return () => window.removeEventListener("mt:transactions-changed", refresh)
  }, [])
  const { summary, expensesByCategory, recentTransactions } = analytics

  const barMax = Math.max(summary.totalIncome, summary.totalExpense, 1)
  const incomeBarPct = (summary.totalIncome / barMax) * 100
  const expenseBarPct = (summary.totalExpense / barMax) * 100

  const firstName = session?.user?.name?.split(" ")[0] ?? "there"
  const balancePositive = summary.balance >= 0

  const totalWalletBalance = getTotalBalance()
  const walletBalancePositive = totalWalletBalance >= 0

  const goals = useSavingsStore((s) => s.goals)
  const getTopGoals = useSavingsStore((s) => s.getTopGoals)
  const topGoals = getTopGoals(2)

  return (
    /**
     * Mobile  : all cards stacked, natural scroll
     * Desktop : 100vh grid
     *   Row A (shrink-0): [Safe to Spend] | [Monthly Overview]  — side by side
     *   Row B (flex-1)  : [Top Categories] | [Recent Transactions]
     */
    <div className="flex flex-col gap-4 max-w-lg mx-auto lg:max-w-none lg:h-[calc(100vh-3rem)]">

      {/* ── Greeting ──────────────────────────────────────────────── */}
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

      {/* ── Wallet Balance Banner ──────────────────────────────────── */}
      {wallets.length > 0 && (
        <Link
          href="/dashboard/wallets"
          className="relative flex rounded-2xl overflow-hidden border border-white/5 shrink-0 hover:border-money-green/20 transition-colors"
        >
          <div className="absolute inset-0 bg-linear-to-br from-[#1c1c1c] to-[#111111]" />
          <div
            className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none"
            style={{ backgroundColor: "#5DD62C", opacity: 0.12 }}
          />
          <div className="relative flex items-center justify-between px-4 py-3 w-full">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-money-green/10 border border-money-green/20 flex items-center justify-center shrink-0">
                <Wallet className="h-4.5 w-4.5 text-money-green" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  Wallets · {wallets.length} {wallets.length === 1 ? "account" : "accounts"}
                </p>
                <p className={`text-base font-bold tabular-nums ${walletBalancePositive ? "text-foreground" : "text-red-400"}`}>
                  {fmtCurrency(totalWalletBalance)}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </Link>
      )}

      {/* ── First-time onboarding card ─────────────────────────────── */}
      {wallets.length === 0 && recentTransactions.length === 0 && (
        <GradientCard glowColor="#5DD62C" glowOpacity={0.15} className="shrink-0">
          <div className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-money-green" />
              <p className="text-sm font-semibold text-foreground">Welcome to Money Tracker!</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Get started in two steps: add a wallet to track your accounts, then log your first transaction.
            </p>
            <div className="flex gap-2">
              <Link
                href="/dashboard/wallets"
                className="flex-1 text-center text-xs font-semibold py-2 rounded-lg bg-money-green text-money-black hover:bg-money-green/90 transition-colors"
              >
                Add a wallet
              </Link>
              <Link
                href="/dashboard/transactions"
                className="flex-1 text-center text-xs font-semibold py-2 rounded-lg border border-money-green/30 text-money-green hover:bg-money-green/10 transition-colors"
              >
                Log a transaction
              </Link>
            </div>
          </div>
        </GradientCard>
      )}

      {/* ── Row A: Safe to Spend + Monthly Overview (side by side) ── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:shrink-0">

        {/* Safe to Spend — stretches to match Monthly Overview height */}
        <div className="lg:flex-1 lg:flex lg:flex-col">
          <SafeToSpend data={analytics} className="flex-1" />
        </div>

        {/* Monthly Overview */}
        <Card className="py-0 lg:flex-1">
          <CardContent className="p-4 flex flex-col">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Monthly Overview
            </p>

            <div className="flex items-center gap-5 mt-3">
              {/* amCharts5 donut */}
              <BudgetRing
                progress={summary.budgetProgress}
                income={summary.totalIncome}
                expense={summary.totalExpense}
              />

              {/* Income / Expense / Balance stats */}
              <div className="flex-1 min-w-0 space-y-3">
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

      {/* ── Row B: Top Categories + Recent Transactions (fills remaining) ── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:flex-1 lg:min-h-0">

        {/* Top Categories */}
        <Card className="py-0 lg:flex-1">
          <CardContent className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-4">
              Top Categories
            </p>
            <CategoryProgressBar categories={expensesByCategory} />
          </CardContent>
        </Card>

        {/* Recent Transactions — scrollable on desktop */}
        <Card className="py-0 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
          <CardContent className="p-4 flex-1 flex flex-col min-h-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground shrink-0">
              Recent Transactions
            </p>

            <div className="mt-4 flex-1 overflow-y-auto min-h-0 space-y-4">
              {recentTransactions.slice(0, 5).map((tx) => (
                <div key={tx._id} className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${tx.category.color}1a`,
                      border: `1px solid ${tx.category.color}33`,
                    }}
                  >
                    <DynamicIcon
                      name={tx.category.icon}
                      className="h-4 w-4"
                      style={{ color: tx.category.color }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.category.name} · {fmtDate(tx.date)}
                    </p>
                  </div>

                  <span className={`text-sm font-semibold shrink-0 tabular-nums ${
                    tx.type === "income" ? "text-money-green" : "text-red-400"
                  }`}>
                    {tx.type === "income" ? "+" : "−"}
                    {fmtCurrency(tx.amount)}
                  </span>
                </div>
              ))}

              {recentTransactions.length === 0 && (
                <div className="text-center py-8 space-y-1">
                  <p className="text-sm text-muted-foreground">No transactions yet</p>
                  <p className="text-xs text-muted-foreground opacity-60">
                    {wallets.length === 0
                      ? "Create a wallet first, then add your transactions"
                      : "Tap + to add your first transaction"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Savings Goals Widget ───────────────────────────────────── */}
      {goals.length > 0 && (
        <Link
          href="/dashboard/budget"
          className="relative block rounded-2xl overflow-hidden border border-white/5 shrink-0 hover:border-money-green/20 transition-colors"
        >
          <div className="absolute inset-0 bg-linear-to-br from-[#1c1c1c] to-[#111111]" />
          <div
            className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none"
            style={{ backgroundColor: "#5DD62C", opacity: 0.12 }}
          />
          <div className="relative p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PiggyBank className="h-3.5 w-3.5 text-money-green" />
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  Savings Goals · {goals.length}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="space-y-2.5">
              {topGoals.map((goal) => {
                const ratio =
                  goal.targetAmount > 0
                    ? Math.min(goal.currentAmount / goal.targetAmount, 1)
                    : 0
                const ringColor =
                  ratio >= 1
                    ? "#FFD700"
                    : ratio >= 0.9
                      ? "#22c55e"
                      : ratio >= 0.7
                        ? "#f59e0b"
                        : "#5DD62C"
                return (
                  <div key={goal.id} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${goal.color}20` }}
                    >
                      <DynamicIcon
                        name={goal.icon}
                        className="h-4 w-4"
                        style={{ color: goal.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {goal.name}
                        </p>
                        <span
                          className="text-[10px] font-bold tabular-nums ml-2 shrink-0"
                          style={{ color: ringColor }}
                        >
                          {Math.round(ratio * 100)}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${ratio * 100}%`,
                            backgroundColor: ringColor,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Link>
      )}
    </div>
  )
}

