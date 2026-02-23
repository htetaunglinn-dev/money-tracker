import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Budget {
  id: string
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  amount: number
  period: "monthly" | "weekly" | "yearly"
  carryOver: boolean
}

interface BudgetStore {
  budgets: Budget[]
  addBudget: (budget: Omit<Budget, "id">) => void
  updateBudget: (id: string, updates: Partial<Omit<Budget, "id">>) => void
  deleteBudget: (id: string) => void
  getTotalMonthlyBudget: () => number
  getBudgetByCategoryId: (categoryId: string) => Budget | undefined
}

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set, get) => ({
      budgets: [],

      addBudget: (budget) => {
        const newBudget: Budget = {
          id: `budget-${Date.now()}`,
          ...budget,
        }
        set((s) => ({ budgets: [...s.budgets, newBudget] }))
      },

      updateBudget: (id, updates) => {
        set((s) => ({
          budgets: s.budgets.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        }))
      },

      deleteBudget: (id) => {
        set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) }))
      },

      getTotalMonthlyBudget: () => {
        const { budgets } = get()
        return budgets.reduce((sum, b) => {
          if (b.period === "monthly") return sum + b.amount
          if (b.period === "weekly") return sum + b.amount * 4
          if (b.period === "yearly") return sum + b.amount / 12
          return sum
        }, 0)
      },

      getBudgetByCategoryId: (categoryId) => {
        return get().budgets.find((b) => b.categoryId === categoryId)
      },
    }),
    { name: "mt-budgets" }
  )
)
