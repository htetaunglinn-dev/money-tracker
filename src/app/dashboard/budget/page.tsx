"use client"

import { useState, useMemo } from "react"
import { Plus, Target } from "lucide-react"
import { toast } from "sonner"
import { useBudgetStore, type Budget } from "@/store/budgetStore"
import { getAnalytics } from "@/lib/data"
import { BudgetCard } from "@/components/BudgetCard"
import { SetBudgetModal } from "@/components/SetBudgetModal"

export default function BudgetPage() {
  const { budgets, addBudget, updateBudget, deleteBudget, getTotalMonthlyBudget } =
    useBudgetStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editBudget, setEditBudget] = useState<Budget | null>(null)

  // Get current month's spending by category from the data layer
  const analytics = useMemo(() => getAnalytics(), [])
  const spentMap = useMemo(() => {
    return Object.fromEntries(
      analytics.expensesByCategory.map((c) => [c._id, c.total])
    )
  }, [analytics])

  const totalBudget = getTotalMonthlyBudget()
  const totalSpent = budgets.reduce(
    (sum, b) => sum + (spentMap[b.categoryId] ?? 0),
    0
  )
  const totalRemaining = Math.max(totalBudget - totalSpent, 0)
  const overallRatio = totalBudget > 0 ? Math.min(totalSpent / totalBudget, 1) : 0

  const existingCategoryIds = budgets.map((b) => b.categoryId)

  function handleSave(data: Omit<Budget, "id">) {
    if (editBudget) {
      updateBudget(editBudget.id, data)
      toast.success("Budget updated")
    } else {
      addBudget(data)
      toast.success("Budget set")
    }
    setEditBudget(null)
  }

  function handleEdit(budget: Budget) {
    setEditBudget(budget)
    setModalOpen(true)
  }

  function handleDelete(id: string) {
    deleteBudget(id)
    toast.success("Budget removed")
  }

  function handleOpenChange(open: boolean) {
    setModalOpen(open)
    if (!open) setEditBudget(null)
  }

  // Color for overall progress
  function progressColor(ratio: number) {
    if (ratio < 0.7) return "#5DD62C"
    if (ratio < 0.9) return "#f59e0b"
    return "#ef4444"
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-money-light">Budget Planner</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-money-green text-money-black text-sm font-semibold hover:bg-money-green/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {/* Overall summary card */}
      {budgets.length > 0 && (
        <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
          <div className="flex justify-between items-baseline mb-3">
            <span className="text-sm text-muted-foreground">Monthly Budget</span>
            <span className="text-xs text-muted-foreground">
              ${totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })} /{" "}
              ${totalBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 rounded-full bg-white/10 mb-3">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${overallRatio * 100}%`,
                backgroundColor: progressColor(overallRatio),
              }}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Budgeted</p>
              <p className="text-sm font-bold text-money-light">
                ${totalBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Spent</p>
              <p
                className="text-sm font-bold"
                style={{ color: progressColor(overallRatio) }}
              >
                ${totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className="text-sm font-bold text-money-green">
                ${totalRemaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Budget cards */}
      {budgets.length > 0 ? (
        <div className="space-y-3">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              spent={spentMap[budget.categoryId] ?? 0}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-money-green/10 flex items-center justify-center mb-4">
            <Target className="h-8 w-8 text-money-green" />
          </div>
          <h2 className="text-lg font-semibold text-money-light mb-1">
            No budgets yet
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">
            Set a monthly budget per category to track your spending and get
            alerts when you&apos;re close to the limit.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-money-green text-money-black font-semibold text-sm hover:bg-money-green/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Set your first budget
          </button>
        </div>
      )}

      <SetBudgetModal
        open={modalOpen}
        onOpenChange={handleOpenChange}
        editBudget={editBudget}
        existingCategoryIds={existingCategoryIds}
        onSave={handleSave}
      />
    </div>
  )
}
