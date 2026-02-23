"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { getCategories } from "@/lib/data"
import { DynamicIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"
import type { Budget } from "@/store/budgetStore"

const schema = z.object({
  categoryId: z.string().min(1, "Select a category"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => parseFloat(v) > 0, "Must be greater than 0"),
  period: z.enum(["monthly", "weekly", "yearly"]),
  carryOver: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface SetBudgetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editBudget?: Budget | null
  existingCategoryIds?: string[]
  onSave: (data: {
    categoryId: string
    categoryName: string
    categoryIcon: string
    categoryColor: string
    amount: number
    period: "monthly" | "weekly" | "yearly"
    carryOver: boolean
  }) => void
}

const PERIOD_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "weekly",  label: "Weekly" },
  { value: "yearly",  label: "Yearly" },
] as const

export function SetBudgetModal({
  open,
  onOpenChange,
  editBudget,
  existingCategoryIds = [],
  onSave,
}: SetBudgetModalProps) {
  const expenseCategories = getCategories().filter((c) => c.type === "expense")
  const isEditing = !!editBudget

  // When editing, the category is already set (can't change it)
  const availableCategories = isEditing
    ? expenseCategories
    : expenseCategories.filter((c) => !existingCategoryIds.includes(c.id))

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      categoryId: "",
      amount: "",
      period: "monthly",
      carryOver: false,
    },
  })

  useEffect(() => {
    if (!open) return
    if (editBudget) {
      form.reset({
        categoryId: editBudget.categoryId,
        amount: editBudget.amount.toString(),
        period: editBudget.period,
        carryOver: editBudget.carryOver,
      })
    } else {
      form.reset({
        categoryId: "",
        amount: "",
        period: "monthly",
        carryOver: false,
      })
    }
  }, [open, editBudget, form])

  function onSubmit(values: FormValues) {
    const cat = expenseCategories.find((c) => c.id === values.categoryId)
    if (!cat) return

    onSave({
      categoryId: cat.id,
      categoryName: cat.name,
      categoryIcon: cat.icon,
      categoryColor: cat.color,
      amount: parseFloat(values.amount),
      period: values.period,
      carryOver: values.carryOver,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#1a1a1a] border-money-green/10 text-money-light max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-money-light">
            {isEditing ? "Edit Budget" : "Set Budget"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Category picker */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">
                    Category
                  </FormLabel>
                  {isEditing ? (
                    // In edit mode, show the current category as read-only
                    (() => {
                      const cat = expenseCategories.find(
                        (c) => c.id === editBudget?.categoryId
                      )
                      return cat ? (
                        <div
                          className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                          style={{
                            backgroundColor: `${cat.color}20`,
                            borderColor: cat.color,
                            color: cat.color,
                          }}
                        >
                          <DynamicIcon name={cat.icon} className="h-4 w-4" />
                          <span className="text-sm font-medium text-money-light">
                            {cat.name}
                          </span>
                        </div>
                      ) : null
                    })()
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto">
                      {availableCategories.map((cat) => {
                        const isSelected = field.value === cat.id
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => field.onChange(cat.id)}
                            className={cn(
                              "flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-all border",
                              isSelected
                                ? "border-current"
                                : "border-transparent text-muted-foreground hover:bg-white/5"
                            )}
                            style={
                              isSelected
                                ? {
                                    backgroundColor: `${cat.color}20`,
                                    borderColor: cat.color,
                                    color: cat.color,
                                  }
                                : {}
                            }
                          >
                            <DynamicIcon name={cat.icon} className="h-5 w-5" />
                            <span className="text-[10px] leading-tight text-center line-clamp-1">
                              {cat.name.split(" ")[0]}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">
                    Budget Amount
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                        $
                      </span>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        inputMode="decimal"
                        className="pl-7 text-2xl font-bold bg-white/5 border-white/10 text-money-light h-14 focus-visible:ring-money-green"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Period */}
            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">
                    Period
                  </FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {PERIOD_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => field.onChange(opt.value)}
                        className={cn(
                          "py-2 rounded-xl text-sm font-semibold transition-all",
                          field.value === opt.value
                            ? "bg-money-green text-money-black"
                            : "bg-white/5 text-muted-foreground hover:bg-white/10"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </FormItem>
              )}
            />

            {/* Carry Over */}
            <FormField
              control={form.control}
              name="carryOver"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                  <div>
                    <FormLabel className="text-sm font-medium text-money-light cursor-pointer">
                      Carry Over
                    </FormLabel>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Roll unused budget into next period
                    </p>
                  </div>
                  <FormControl>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={field.value}
                      onClick={() => field.onChange(!field.value)}
                      className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                        field.value ? "bg-money-green" : "bg-white/20"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg transition-transform",
                          field.value ? "translate-x-4" : "translate-x-0"
                        )}
                      />
                    </button>
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-money-green text-money-black font-bold h-12 hover:bg-money-green/90"
            >
              {isEditing ? "Save Changes" : "Set Budget"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
