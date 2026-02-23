"use client"

import { useRef, useState } from "react"
import { Trash2 } from "lucide-react"
import { type StoredTransaction, type StoredCategory } from "@/lib/data"
import { getIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { useFmtCurrency } from "@/store/settingsStore"

interface TransactionListProps {
  transactions: StoredTransaction[]
  categories: StoredCategory[]
  onEdit: (tx: StoredTransaction) => void
  onDelete: (id: string) => void
}

interface DateGroup {
  label: string
  items: StoredTransaction[]
}

function groupByDate(transactions: StoredTransaction[]): DateGroup[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const groups = new Map<string, StoredTransaction[]>()

  for (const tx of transactions) {
    const date = new Date(tx.date)
    date.setHours(0, 0, 0, 0)

    let label: string
    if (date.getTime() === today.getTime()) {
      label = "Today"
    } else if (date.getTime() === yesterday.getTime()) {
      label = "Yesterday"
    } else {
      label = date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    }

    const group = groups.get(label) ?? []
    group.push(tx)
    groups.set(label, group)
  }

  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }))
}

// ─── Swipeable row ────────────────────────────────────────────────────────────

interface SwipeableRowProps {
  children: React.ReactNode
  onDelete: () => void
}

function SwipeableRow({ children, onDelete }: SwipeableRowProps) {
  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)

  function handleTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
    setIsDragging(true)
  }

  function handleTouchMove(e: React.TouchEvent) {
    const delta = e.touches[0].clientX - startX.current
    if (delta < 0) {
      setOffset(Math.max(delta, -80))
    } else if (offset < 0) {
      setOffset(Math.min(delta + offset, 0))
    }
  }

  function handleTouchEnd() {
    setIsDragging(false)
    if (offset < -40) {
      setOffset(-80)
    } else {
      setOffset(0)
    }
  }

  function handleDeleteClick() {
    setOffset(0)
    onDelete()
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Delete button (revealed by swipe) */}
      <div className="absolute right-0 top-0 bottom-0 w-20 flex items-center justify-center bg-red-500 rounded-r-xl">
        <button
          onClick={handleDeleteClick}
          className="flex flex-col items-center gap-1 text-white"
          aria-label="Delete transaction"
        >
          <Trash2 className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Delete</span>
        </button>
      </div>

      {/* Swipeable content */}
      <div
        className={cn(
          "relative bg-[#1a1a1a]",
          !isDragging && "transition-transform duration-200"
        )}
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TransactionList({
  transactions,
  categories,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const fmtCurrency = useFmtCurrency()
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]))

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <span className="text-3xl">💸</span>
        </div>
        <p className="text-sm font-medium text-muted-foreground">No transactions yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Tap the <span className="text-money-green font-semibold">+</span> button to add one
        </p>
      </div>
    )
  }

  const groups = groupByDate(transactions)

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.label}>
          {/* Date header */}
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2">
            {group.label}
          </p>

          <div className="space-y-1">
            {group.items.map((tx) => {
              const cat = catMap[tx.categoryId] ?? {
                name: "Unknown",
                icon: "circle",
                color: "#888",
              }
              const Icon = getIcon(cat.icon)

              return (
                <SwipeableRow key={tx.id} onDelete={() => onDelete(tx.id)}>
                  <button
                    onClick={() => onEdit(tx)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left"
                  >
                    {/* Category icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${cat.color}1a`,
                        border: `1px solid ${cat.color}33`,
                      }}
                    >
                      <Icon className="h-5 w-5" style={{ color: cat.color }} />
                    </div>

                    {/* Description + category */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {tx.description}
                      </p>
                      <p className="text-xs text-muted-foreground">{cat.name}</p>
                    </div>

                    {/* Amount */}
                    <span
                      className={cn(
                        "text-sm font-semibold shrink-0 tabular-nums",
                        tx.type === "income" ? "text-money-green" : "text-red-400"
                      )}
                    >
                      {tx.type === "income" ? "+" : "−"}
                      {fmtCurrency(tx.amount)}
                    </span>
                  </button>
                </SwipeableRow>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
