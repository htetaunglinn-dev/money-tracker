"use client"

import { Pencil, Trash2, Plus } from "lucide-react"
import { DynamicIcon } from "@/lib/icons"
import type { SavingsGoal } from "@/store/savingsStore"
import { useFmtCurrency } from "@/store/settingsStore"

const CIRCUMFERENCE = 2 * Math.PI * 34
const NOW = Date.now()

function getGoalProgressColor(ratio: number): string {
  if (ratio >= 1) return "#FFD700"
  if (ratio >= 0.9) return "#22c55e"
  if (ratio >= 0.7) return "#f59e0b"
  return "#5DD62C"
}

interface SavingsGoalCardProps {
  goal: SavingsGoal
  onContribute: (goal: SavingsGoal) => void
  onEdit: (goal: SavingsGoal) => void
  onDelete: (id: string) => void
}

export function SavingsGoalCard({
  goal,
  onContribute,
  onEdit,
  onDelete,
}: SavingsGoalCardProps) {
  const fmt = useFmtCurrency()
  const ratio =
    goal.targetAmount > 0
      ? Math.min(goal.currentAmount / goal.targetAmount, 1)
      : 0
  const pct = Math.round(ratio * 100)
  const color = getGoalProgressColor(ratio)
  const isComplete = ratio >= 1
  const offset = CIRCUMFERENCE * (1 - ratio)

  const daysLeft =
    goal.deadline
      ? Math.max(
          0,
          Math.ceil(
            (new Date(goal.deadline).getTime() - NOW) / 86_400_000
          )
        )
      : null

  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0)

  return (
    <div
      className="bg-white/5 rounded-2xl p-4 border transition-colors"
      style={{
        borderColor: isComplete ? `${color}40` : "rgba(255,255,255,0.05)",
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${goal.color}20` }}
          >
            <DynamicIcon
              name={goal.icon}
              className="h-5 w-5"
              style={{ color: goal.color }}
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-money-light truncate">
              {goal.name}
            </p>
            {isComplete && (
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Goal Reached
              </span>
            )}
            {!isComplete && daysLeft !== null && (
              <p className="text-xs text-muted-foreground">
                {daysLeft > 0 ? `${daysLeft} days left` : "Deadline passed"}
              </p>
            )}
            {!isComplete && daysLeft === null && (
              <p className="text-xs text-muted-foreground">No deadline</p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onContribute(goal)}
            aria-label="Add contribution"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-money-green hover:bg-money-green/10 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onEdit(goal)}
            aria-label="Edit goal"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-money-light hover:bg-white/10 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            aria-label="Delete goal"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Progress ring + stats */}
      <div className="mt-4 flex items-center gap-4">
        {/* SVG Ring */}
        <div className="shrink-0 relative w-20 h-20">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="currentColor"
              className="text-white/10"
              strokeWidth="6"
            />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke={color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              transform="rotate(-90 40 40)"
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-sm font-bold leading-none"
              style={{ color }}
            >
              {pct}%
            </span>
          </div>
        </div>

        {/* Amount stats */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Saved</span>
            <span className="font-semibold" style={{ color }}>
              {fmt(goal.currentAmount)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Target</span>
            <span className="font-semibold text-money-light">
              {fmt(goal.targetAmount)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Remaining</span>
            <span className="font-semibold text-muted-foreground">
              {fmt(remaining)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
