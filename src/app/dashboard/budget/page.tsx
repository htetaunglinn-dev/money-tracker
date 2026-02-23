"use client"

import { useState, useMemo } from "react"
import { Plus, Target, PiggyBank } from "lucide-react"
import { toast } from "sonner"
import { useBudgetStore, type Budget } from "@/store/budgetStore"
import { useSavingsStore, type SavingsGoal } from "@/store/savingsStore"
import { getAnalytics } from "@/lib/data"
import { BudgetCard } from "@/components/BudgetCard"
import { SetBudgetModal } from "@/components/SetBudgetModal"
import { SavingsGoalCard } from "@/components/SavingsGoalCard"
import { AddGoalModal } from "@/components/AddGoalModal"
import { ContributeModal } from "@/components/ContributeModal"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function BudgetPage() {
  // ── Budget state ────────────────────────────────────────────────────────────
  const { budgets, addBudget, updateBudget, deleteBudget, getTotalMonthlyBudget } =
    useBudgetStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editBudget, setEditBudget] = useState<Budget | null>(null)

  // ── Savings state ────────────────────────────────────────────────────────────
  const { goals, deleteGoal } = useSavingsStore()
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [editGoal, setEditGoal] = useState<SavingsGoal | null>(null)
  const [contributeGoal, setContributeGoal] = useState<SavingsGoal | null>(null)
  const [contributeOpen, setContributeOpen] = useState(false)

  // ── Active tab ───────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("budget")

  // ── Analytics ───────────────────────────────────────────────────────────────
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

  // ── Budget handlers ──────────────────────────────────────────────────────────
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

  // ── Goal handlers ────────────────────────────────────────────────────────────
  function handleEditGoal(goal: SavingsGoal) {
    setEditGoal(goal)
    setGoalModalOpen(true)
  }

  function handleGoalModalClose(open: boolean) {
    setGoalModalOpen(open)
    if (!open) setEditGoal(null)
  }

  function handleContribute(goal: SavingsGoal) {
    setContributeGoal(goal)
    setContributeOpen(true)
  }

  function handleContributeClose(open: boolean) {
    setContributeOpen(open)
    if (!open) setContributeGoal(null)
  }

  function handleDeleteGoal(id: string) {
    deleteGoal(id)
    toast.success("Goal removed")
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
          <h1 className="text-xl font-bold text-money-light">
            {activeTab === "budget" ? "Budget Planner" : "Savings Goals"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
          </p>
        </div>
        <button
          onClick={() =>
            activeTab === "budget" ? setModalOpen(true) : setGoalModalOpen(true)
          }
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-money-green text-money-black text-sm font-semibold hover:bg-money-green/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full bg-white/5 rounded-xl p-1 h-auto">
          <TabsTrigger
            value="budget"
            className="rounded-lg text-sm py-2 data-[state=active]:bg-money-green data-[state=active]:text-money-black data-[state=inactive]:text-muted-foreground"
          >
            <Target className="h-3.5 w-3.5 mr-1.5" />
            Budget
          </TabsTrigger>
          <TabsTrigger
            value="goals"
            className="rounded-lg text-sm py-2 data-[state=active]:bg-money-green data-[state=active]:text-money-black data-[state=inactive]:text-muted-foreground"
          >
            <PiggyBank className="h-3.5 w-3.5 mr-1.5" />
            Goals
          </TabsTrigger>
        </TabsList>

        {/* ── Budget Tab ─────────────────────────────────────────────────────── */}
        <TabsContent value="budget" className="mt-4 space-y-3">
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
        </TabsContent>

        {/* ── Goals Tab ──────────────────────────────────────────────────────── */}
        <TabsContent value="goals" className="mt-4 space-y-3">
          {goals.length > 0 ? (
            goals.map((goal) => (
              <SavingsGoalCard
                key={goal.id}
                goal={goal}
                onContribute={handleContribute}
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-money-green/10 flex items-center justify-center mb-4">
                <PiggyBank className="h-8 w-8 text-money-green" />
              </div>
              <h2 className="text-lg font-semibold text-money-light mb-1">
                No goals yet
              </h2>
              <p className="text-sm text-muted-foreground max-w-xs mb-6">
                Set a savings goal to track your progress toward something
                meaningful — a vacation, emergency fund, or big purchase.
              </p>
              <button
                onClick={() => setGoalModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-money-green text-money-black font-semibold text-sm hover:bg-money-green/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create your first goal
              </button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <SetBudgetModal
        open={modalOpen}
        onOpenChange={handleOpenChange}
        editBudget={editBudget}
        existingCategoryIds={existingCategoryIds}
        onSave={handleSave}
      />
      <AddGoalModal
        open={goalModalOpen}
        onOpenChange={handleGoalModalClose}
        editGoal={editGoal}
      />
      <ContributeModal
        open={contributeOpen}
        onOpenChange={handleContributeClose}
        goal={contributeGoal}
      />
    </div>
  )
}
