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
import {
  addTransaction,
  updateTransaction,
  getCategories,
  getAnalytics,
  type StoredTransaction,
} from "@/lib/data"
import { getIcon, DynamicIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { useWalletStore } from "@/store/walletStore"
import { useBudgetStore } from "@/store/budgetStore"
import { useCurrencySymbol } from "@/store/settingsStore"

const schema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => parseFloat(v) > 0, "Must be greater than 0"),
  categoryId: z.string().min(1, "Select a category"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  walletId: z.string().min(1, "Select a wallet"),
})

type FormValues = z.infer<typeof schema>

interface QuickAddModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTransaction?: StoredTransaction | null
  onSuccess?: () => void
}

export function QuickAddModal({
  open,
  onOpenChange,
  editTransaction,
  onSuccess,
}: QuickAddModalProps) {
  const categories = getCategories()
  const symbol = useCurrencySymbol()
  const wallets = useWalletStore((s) => s.wallets)
  const defaultWalletId = useWalletStore((s) => s.defaultWalletId)
  const getBudgetByCategoryId = useBudgetStore((s) => s.getBudgetByCategoryId)
  const isEditing = !!editTransaction

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "expense",
      amount: "",
      categoryId: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      walletId: defaultWalletId ?? "",
    },
  })

  const selectedType = form.watch("type")
  const filteredCategories = categories.filter((c) => c.type === selectedType)

  useEffect(() => {
    if (!open) return
    if (editTransaction) {
      form.reset({
        type: editTransaction.type,
        amount: editTransaction.amount.toString(),
        categoryId: editTransaction.categoryId,
        description: editTransaction.description,
        date: editTransaction.date.split("T")[0],
        walletId: editTransaction.walletId ?? defaultWalletId ?? "",
      })
    } else {
      form.reset({
        type: "expense",
        amount: "",
        categoryId: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        walletId: defaultWalletId ?? "",
      })
    }
  }, [open, editTransaction, form, defaultWalletId])

  function onSubmit(values: FormValues) {
    const payload = {
      type: values.type,
      amount: parseFloat(values.amount),
      categoryId: values.categoryId,
      description: values.description,
      date: new Date(values.date).toISOString(),
      walletId: values.walletId,
    }

    if (isEditing && editTransaction) {
      updateTransaction(editTransaction.id, payload)
      toast.success("Transaction updated")
    } else {
      addTransaction(payload)
      toast.success("Transaction added")

      // Check for overspend if this is an expense with a budget
      if (payload.type === "expense") {
        const budget = getBudgetByCategoryId(payload.categoryId)
        if (budget) {
          const analytics = getAnalytics()
          const spent =
            analytics.expensesByCategory.find((c) => c._id === payload.categoryId)
              ?.total ?? 0
          if (spent > budget.amount) {
            const overage = (spent - budget.amount).toFixed(2)
            const cat = categories.find((c) => c.id === payload.categoryId)
            toast.warning(
              `Over budget on ${cat?.name ?? "this category"} by ${symbol}${overage}`,
              { duration: 5000 }
            )
          }
        }
      }
    }

    onOpenChange(false)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-money-green/10 text-card-foreground max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">
            {isEditing ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Type toggle */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-2 gap-2">
                    {(["expense", "income"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          field.onChange(t)
                          form.setValue("categoryId", "")
                        }}
                        className={cn(
                          "py-2.5 rounded-xl text-sm font-semibold capitalize transition-all",
                          field.value === t
                            ? t === "income"
                              ? "bg-money-green text-money-black"
                              : "bg-red-500 text-white"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
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
                    Amount
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                        {symbol}
                      </span>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        inputMode="decimal"
                        className="pl-7 text-2xl font-bold bg-muted border-border text-card-foreground h-14 focus-visible:ring-money-green"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">
                    Category
                  </FormLabel>
                  <div className="relative">
                  <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pb-1">
                    {filteredCategories.map((cat) => {
                      const Icon = getIcon(cat.icon)
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
                              : "border-transparent text-muted-foreground hover:bg-muted"
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
                          <Icon className="h-5 w-5" />
                          <span className="text-[10px] leading-tight text-center line-clamp-1">
                            {cat.name.split(" ")[0]}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  {filteredCategories.length > 6 && (
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-card to-transparent rounded-b-xl" />
                  )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. Lunch at Café"
                      className="bg-muted border-border text-card-foreground focus-visible:ring-money-green"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">
                    Date
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      className="bg-muted border-border text-card-foreground focus-visible:ring-money-green"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Wallet (required) */}
            <FormField
              control={form.control}
              name="walletId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">
                    Wallet
                  </FormLabel>
                  {wallets.length === 0 ? (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-muted border border-border">
                      <DynamicIcon name="wallet" className="h-4 w-4 text-muted-foreground shrink-0" />
                      <p className="text-xs text-muted-foreground flex-1">
                        No wallets yet.{" "}
                        <a
                          href="/dashboard/wallets"
                          className="text-money-green underline underline-offset-2"
                          onClick={() => onOpenChange(false)}
                        >
                          Create one
                        </a>{" "}
                        to track balances.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {wallets.map((w) => {
                        const isSelected = field.value === w.id
                        return (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => field.onChange(w.id)}
                            className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all border",
                              isSelected
                                ? "border-current"
                                : "border-transparent text-muted-foreground hover:bg-muted"
                            )}
                            style={
                              isSelected
                                ? {
                                    backgroundColor: `${w.color}20`,
                                    borderColor: w.color,
                                    color: w.color,
                                  }
                                : {}
                            }
                          >
                            <DynamicIcon name={w.icon} className="h-3.5 w-3.5" />
                            <span>{w.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-money-green text-money-black font-bold h-12 hover:bg-money-green/90"
            >
              {isEditing ? "Save Changes" : "Add Transaction"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
