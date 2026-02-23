"use client"

import { Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Budget } from "@/store/budgetStore"
import { DynamicIcon } from "@/lib/icons"
import { useFmtCurrency } from "@/store/settingsStore"

interface BudgetCardProps {
  budget: Budget
  spent: number
  onEdit: (budget: Budget) => void
  onDelete: (id: string) => void
}

function getProgressColor(ratio: number): string {
  if (ratio < 0.70) return "#5DD62C"   // green
  if (ratio < 0.90) return "#f59e0b"   // amber
  return "#ef4444"                       // red
}

function getProgressBg(ratio: number): string {
  if (ratio < 0.70) return "bg-money-green/20"
  if (ratio < 0.90) return "bg-amber-500/20"
  return "bg-red-500/20"
}

export function BudgetCard({ budget, spent, onEdit, onDelete }: BudgetCardProps) {
  const fmt = useFmtCurrency()
  const ratio = budget.amount > 0 ? Math.min(spent / budget.amount, 1) : 0
  const remaining = Math.max(budget.amount - spent, 0)
  const isOver = spent > budget.amount
  const color = getProgressColor(ratio)
  const pct = Math.min(ratio * 100, 100)

  const periodLabel =
    budget.period === "monthly" ? "/mo"
    : budget.period === "weekly" ? "/wk"
    : "/yr"

  return (
    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${budget.categoryColor}20` }}
          >
            <DynamicIcon
              name={budget.categoryIcon}
              className="h-5 w-5"
              style={{ color: budget.categoryColor }}
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-money-light truncate">
              {budget.categoryName}
            </p>
            <p className="text-xs text-muted-foreground">
              {fmt(budget.amount)}{periodLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(budget)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-money-light hover:bg-white/10 transition-colors"
            aria-label="Edit budget"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(budget.id)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
            aria-label="Delete budget"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 space-y-1.5">
        <div className={cn("w-full h-2 rounded-full", getProgressBg(ratio))}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>

        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">
            Spent{" "}
            <span className="font-semibold" style={{ color }}>
              {fmt(spent)}
            </span>
          </span>
          {isOver ? (
            <span className="text-red-400 font-semibold">
              {fmt(spent - budget.amount)} over
            </span>
          ) : (
            <span className="text-muted-foreground">
              {fmt(remaining)}{" "}left
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
