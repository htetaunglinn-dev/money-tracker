"use client"

import { useState, useCallback } from "react"
import { TrendingUp, TrendingDown, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getTransactions,
  getCategories,
  deleteTransaction,
  type StoredTransaction,
} from "@/lib/data"
import { TransactionList } from "@/components/TransactionList"
import { QuickAddModal } from "@/components/QuickAddModal"
import { cn } from "@/lib/utils"
import { useFmtCurrency } from "@/store/settingsStore"
import { GradientCard } from "@/components/ui/gradient-card"

const TABS = ["All", "Income", "Expense"] as const
type Tab = (typeof TABS)[number]

const PAGE_SIZE = 20

export default function TransactionsPage() {
  const fmtCurrency = useFmtCurrency()
  const [tab, setTab] = useState<Tab>("All")
  const [editingTx, setEditingTx] = useState<StoredTransaction | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [refresh, setRefresh] = useState(0)

  // Re-read from sessionStorage on every render (refresh counter forces re-reads after mutations)
  const allTransactions = getTransactions()
  const categories = getCategories()

  const filtered = allTransactions.filter((tx) => {
    if (tab === "Income") return tx.type === "income"
    if (tab === "Expense") return tx.type === "expense"
    return true
  })

  const totalIncome = allTransactions
    .filter((tx) => tx.type === "income")
    .reduce((s, tx) => s + tx.amount, 0)
  const totalExpense = allTransactions
    .filter((tx) => tx.type === "expense")
    .reduce((s, tx) => s + tx.amount, 0)

  const paginated = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = filtered.length > paginated.length

  function handleDelete(id: string) {
    deleteTransaction(id)
    window.dispatchEvent(new Event("mt:transactions-changed"))
    setRefresh((r) => r + 1)
  }

  function handleEdit(tx: StoredTransaction) {
    setEditingTx(tx)
    setModalOpen(true)
  }

  const handleSuccess = useCallback(() => {
    window.dispatchEvent(new Event("mt:transactions-changed"))
    setEditingTx(null)
    setRefresh((r) => r + 1)
  }, [])

  function handleModalOpenChange(open: boolean) {
    setModalOpen(open)
    if (!open) setEditingTx(null)
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-1 shrink-0">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">Transactions</h1>
          <p className="text-xs text-muted-foreground">{allTransactions.length} transactions</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <GradientCard glowColor="#5DD62C" glowOpacity={0.22}>
          <div className="p-3 flex items-center gap-3 bg-money-green/8">
            <TrendingUp className="h-5 w-5 text-money-green shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Income
              </p>
              <p className="text-sm font-bold text-money-green tabular-nums">
                {fmtCurrency(totalIncome)}
              </p>
            </div>
          </div>
        </GradientCard>

        <GradientCard glowColor="#ef4444" glowOpacity={0.22}>
          <div className="p-3 flex items-center gap-3 bg-red-500/8">
            <TrendingDown className="h-5 w-5 text-red-400 shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Expenses
              </p>
              <p className="text-sm font-bold text-red-400 tabular-nums">
                {fmtCurrency(totalExpense)}
              </p>
            </div>
          </div>
        </GradientCard>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t)
              setPage(1)
            }}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
              tab === t
                ? "bg-money-green text-money-black scale-105"
                : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground hover:scale-105 active:scale-95"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Transaction list — key on refresh so swipe states reset after mutations */}
      <TransactionList
        key={refresh}
        transactions={paginated}
        categories={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {hasMore && (
        <Button
          variant="outline"
          onClick={() => setPage((p) => p + 1)}
          className="w-full gap-2 border-money-green/20 text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className="h-4 w-4" />
          Load more ({filtered.length - paginated.length} remaining)
        </Button>
      )}

      {/* Edit modal (separate from layout FAB modal) */}
      <QuickAddModal
        open={modalOpen}
        onOpenChange={handleModalOpenChange}
        editTransaction={editingTx}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
