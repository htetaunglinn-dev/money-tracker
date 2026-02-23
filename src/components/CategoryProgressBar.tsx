"use client"

import type { AnalyticsData } from "@/lib/data"
import { useCurrencySymbol } from "@/store/settingsStore"

interface Props {
  categories: AnalyticsData["expensesByCategory"]
}

export function CategoryProgressBar({ categories }: Props) {
  const symbol = useCurrencySymbol()
  const top3 = categories.slice(0, 3)
  const maxTotal = top3[0]?.total ?? 1

  if (top3.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No expense data yet. Add your first expense!
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {top3.map((cat) => {
        const pct = (cat.total / maxTotal) * 100
        return (
          <div key={cat._id}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-sm font-medium truncate">{cat.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {cat.count} txn{cat.count !== 1 ? "s" : ""}
                </span>
              </div>
              <span className="text-sm font-semibold ml-2 shrink-0">
                {symbol}{cat.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: cat.color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
