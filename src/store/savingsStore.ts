import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string | null
  icon: string
  color: string
  createdAt: string
}

interface SavingsStore {
  goals: SavingsGoal[]
  addGoal: (goal: Omit<SavingsGoal, "id" | "createdAt">) => void
  updateGoal: (
    id: string,
    updates: Partial<Omit<SavingsGoal, "id" | "createdAt">>
  ) => void
  deleteGoal: (id: string) => void
  addContribution: (id: string, amount: number) => SavingsGoal | undefined
  getTopGoals: (count: number) => SavingsGoal[]
}

export const useSavingsStore = create<SavingsStore>()(
  persist(
    (set, get) => ({
      goals: [],

      addGoal: (goal) => {
        const newGoal: SavingsGoal = {
          id: `goal-${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...goal,
        }
        set((s) => ({ goals: [...s.goals, newGoal] }))
      },

      updateGoal: (id, updates) => {
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        }))
      },

      deleteGoal: (id) => {
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }))
      },

      addContribution: (id, amount) => {
        let updatedGoal: SavingsGoal | undefined
        set((s) => ({
          goals: s.goals.map((g) => {
            if (g.id !== id) return g
            const next: SavingsGoal = {
              ...g,
              currentAmount: g.currentAmount + amount,
            }
            updatedGoal = next
            return next
          }),
        }))
        return updatedGoal
      },

      getTopGoals: (count) =>
        [...get().goals]
          .sort((a, b) => {
            const ratioA =
              a.targetAmount > 0 ? a.currentAmount / a.targetAmount : 0
            const ratioB =
              b.targetAmount > 0 ? b.currentAmount / b.targetAmount : 0
            return ratioB - ratioA
          })
          .slice(0, count),
    }),
    { name: "mt-savings" }
  )
)
