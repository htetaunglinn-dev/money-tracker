"use client"

import { cn } from "@/lib/utils"
import type { AnalyticsData } from "@/lib/data"

interface Props {
  data: AnalyticsData
  className?: string
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Math.max(0, n))

export function SafeToSpend({ data, className }: Props) {
  const { safeToSpend, budgetProgress, totalIncome, remainingDays } = data.summary

  const isAmber = budgetProgress >= 0.7 && budgetProgress < 0.9
  const isRed = budgetProgress >= 0.9

  const amountColor = isRed ? "text-red-400" : isAmber ? "text-amber-400" : "text-money-green"
  const glowHex = isRed ? "#f87171" : isAmber ? "#fbbf24" : "#5DD62C"

  const label = isRed
    ? "Over budget — cut back now"
    : isAmber
      ? "Spending up — be mindful"
      : "You're on track this month"

  return (
    <div className={cn("relative rounded-2xl overflow-hidden border border-white/5", className)}>
      {/* Base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1c1c1c] to-[#111111]" />
      {/* Glow blob */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-25 pointer-events-none"
        style={{ backgroundColor: glowHex }}
      />

      <div className="relative p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Safe to Spend Today
        </p>

        <div className={`text-4xl font-black mt-1.5 tabular-nums tracking-tight ${amountColor}`}>
          {fmt(safeToSpend)}
        </div>

        {/* Progress bar */}
        <div className="mt-3 space-y-1.5">
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min(budgetProgress * 100, 100)}%`,
                backgroundColor: glowHex,
              }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>{label}</span>
            <span>{remainingDays} days left</span>
          </div>
        </div>

        {totalIncome === 0 && (
          <p className="text-[11px] text-muted-foreground mt-2 italic">
            Add income transactions to activate this widget
          </p>
        )}
      </div>
    </div>
  )
}
