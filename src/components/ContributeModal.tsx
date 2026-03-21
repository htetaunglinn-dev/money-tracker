"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DynamicIcon } from "@/lib/icons"
import { useSavingsStore, type SavingsGoal } from "@/store/savingsStore"
import { useCurrencySymbol } from "@/store/settingsStore"

const schema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => parseFloat(v) > 0, "Must be greater than 0"),
})

type FormValues = z.infer<typeof schema>

const QUICK_AMOUNTS = [10, 50, 100, 500]

interface ContributeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal: SavingsGoal | null
}

export function ContributeModal({
  open,
  onOpenChange,
  goal,
}: ContributeModalProps) {
  const addContribution = useSavingsStore((s) => s.addContribution)
  const symbol = useCurrencySymbol()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: "" },
  })

  useEffect(() => {
    if (!open) return
    form.reset({ amount: "" })
  }, [open, form])

  function onSubmit(values: FormValues) {
    if (!goal) return
    const amount = parseFloat(values.amount)
    const updated = addContribution(goal.id, amount)

    if (updated && updated.currentAmount >= updated.targetAmount) {
      toast.success(`🎉 "${updated.name}" goal reached!`, { duration: 5000 })
    } else {
      toast.success(
        `${symbol}${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} added to "${goal.name}"`
      )
    }
    onOpenChange(false)
  }

  const ratio =
    goal && goal.targetAmount > 0
      ? Math.min(goal.currentAmount / goal.targetAmount, 1)
      : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-card border-money-green/10 text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">
            Add to {goal?.name ?? "Goal"}
          </DialogTitle>
        </DialogHeader>

        {/* Goal summary */}
        {goal && (
          <div className="flex items-center gap-3 bg-muted rounded-xl p-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${goal.color}20` }}
            >
              <DynamicIcon
                name={goal.icon}
                className="h-4 w-4"
                style={{ color: goal.color }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <p className="text-xs font-semibold text-card-foreground truncate">
                  {goal.name}
                </p>
                <span className="text-[10px] font-bold ml-2 shrink-0 text-muted-foreground">
                  {Math.round(ratio * 100)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${ratio * 100}%`,
                    backgroundColor: goal.color,
                  }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                ${goal.currentAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
                / ${goal.targetAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Quick amounts */}
            <div className="grid grid-cols-4 gap-2">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => form.setValue("amount", amt.toString())}
                  className="py-2 rounded-xl bg-muted text-xs font-semibold text-muted-foreground hover:bg-money-green/10 hover:text-money-green transition-colors"
                >
                  +{amt}
                </button>
              ))}
            </div>

            {/* Amount input */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">
                        $
                      </span>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-8 h-14 text-2xl font-bold bg-muted border-border text-card-foreground placeholder:text-muted-foreground/30 focus:border-money-green/50"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-money-green text-money-black font-bold h-12 hover:bg-money-green/90"
            >
              Add Contribution
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
