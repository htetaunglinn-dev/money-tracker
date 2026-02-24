"use client"

import { useState, useMemo } from "react"
import dynamic from "next/dynamic"
import { BarChart3, TrendingUp, TrendingDown, ReceiptText } from "lucide-react"
import { getReportsData, type ReportPeriod } from "@/lib/data"
import { SpendingCalendar } from "@/components/SpendingCalendar"
import { useCurrencySymbol } from "@/store/settingsStore"
import { GradientCard } from "@/components/ui/gradient-card"

const DonutChart = dynamic(
  () => import("@/components/DonutChart").then((m) => ({ default: m.DonutChart })),
  {
    ssr: false,
    loading: () => <div className="h-55 animate-pulse rounded-xl bg-white/5" />,
  }
)

const TrendLineChart = dynamic(
  () => import("@/components/TrendLineChart").then((m) => ({ default: m.TrendLineChart })),
  {
    ssr: false,
    loading: () => <div className="h-44 animate-pulse rounded-xl bg-white/5" />,
  }
)

const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: "week", label: "W" },
  { value: "month", label: "M" },
  { value: "year", label: "Y" },
]

export default function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>("month")
  const data = useMemo(() => getReportsData(period), [period])
  const currency = useCurrencySymbol()

  const now = new Date()

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-money-light">Reports</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{data.summary.label}</p>
        </div>
        {/* Period switcher */}
        <div className="flex gap-0.5 bg-white/5 rounded-xl p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                period === p.value
                  ? "bg-money-green text-money-black"
                  : "text-muted-foreground hover:text-money-light"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-2">
        <GradientCard glowColor="#5DD62C" glowOpacity={0.18} className="rounded-xl">
          <div className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground mb-1">Income</p>
            <p className="text-sm font-bold text-money-green">
              {currency}
              {data.summary.totalIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </GradientCard>
        <GradientCard glowColor="#ef4444" glowOpacity={0.18} className="rounded-xl">
          <div className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground mb-1">Expense</p>
            <p className="text-sm font-bold text-red-400">
              {currency}
              {data.summary.totalExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </GradientCard>
        <GradientCard
          glowColor={data.summary.balance >= 0 ? "#5DD62C" : "#ef4444"}
          glowOpacity={0.18}
          className="rounded-xl"
        >
          <div className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground mb-1">Balance</p>
            <p
              className={`text-sm font-bold ${
                data.summary.balance >= 0 ? "text-money-green" : "text-red-400"
              }`}
            >
              {data.summary.balance < 0 ? "-" : ""}
              {currency}
              {Math.abs(data.summary.balance).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </GradientCard>
      </div>

      {/* Spending Insights / Nudges */}
      {data.nudges.length > 0 && (
        <GradientCard glowOpacity={0.15}>
          <div className="p-4 space-y-2">
            <h2 className="text-sm font-semibold text-money-light flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-money-green" />
              Spending Insights
            </h2>
            <div className="space-y-2">
              {data.nudges.slice(0, 3).map((nudge, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  {nudge.direction === "up" ? (
                    <TrendingUp className="h-4 w-4 text-red-400 shrink-0" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-money-green shrink-0" />
                  )}
                  <span className="text-xs text-muted-foreground">{nudge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </GradientCard>
      )}

      {/* Donut chart — spending by category */}
      <GradientCard glowOpacity={0.15}>
        <div className="p-4">
          <h2 className="text-sm font-semibold text-money-light mb-4">Spending by Category</h2>
          <DonutChart data={data.expensesByCategory} currency={currency} />
        </div>
      </GradientCard>

      {/* Trend line chart — 6 months */}
      <GradientCard glowOpacity={0.15}>
        <div className="p-4">
          <h2 className="text-sm font-semibold text-money-light mb-3">
            Income vs Expense
            <span className="text-[10px] font-normal text-muted-foreground ml-1.5">(6 months)</span>
          </h2>
          {data.monthlyTrend.some((m) => m.income > 0 || m.expense > 0) ? (
            <TrendLineChart data={data.monthlyTrend} currency={currency} />
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
              <ReceiptText className="h-8 w-8 text-muted-foreground opacity-40" />
              <p className="text-sm text-muted-foreground">No trend data yet</p>
              <p className="text-xs text-muted-foreground opacity-60">Add income or expense transactions to see your 6-month trend</p>
            </div>
          )}
        </div>
      </GradientCard>

      {/* Calendar heatmap */}
      <GradientCard glowOpacity={0.15}>
        <div className="p-4">
          <h2 className="text-sm font-semibold text-money-light mb-4">
            Daily Spending —{" "}
            {now.toLocaleString("default", { month: "long", year: "numeric" })}
          </h2>
          {data.calendarData.length > 0 ? (
            <SpendingCalendar
              data={data.calendarData}
              year={now.getFullYear()}
              month={now.getMonth()}
              currencySymbol={currency}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
              <ReceiptText className="h-8 w-8 text-muted-foreground opacity-40" />
              <p className="text-sm text-muted-foreground">No spending this month</p>
              <p className="text-xs text-muted-foreground opacity-60">Expense transactions will appear here as a daily heatmap</p>
            </div>
          )}
        </div>
      </GradientCard>
    </div>
  )
}
