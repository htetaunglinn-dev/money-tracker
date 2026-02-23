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
  type StoredTransaction,
} from "@/lib/data"
import { getIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { useWalletStore } from "@/store/walletStore"

const schema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => parseFloat(v) > 0, "Must be greater than 0"),
  categoryId: z.string().min(1, "Select a category"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  walletId: z.string().optional(),
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
  const wallets = useWalletStore((s) => s.wallets)
  const isEditing = !!editTransaction

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "expense",
      amount: "",
      categoryId: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      walletId: undefined,
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
        walletId: editTransaction.walletId,
      })
    } else {
      form.reset({
        type: "expense",
        amount: "",
        categoryId: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        walletId: undefined,
      })
    }
  }, [open, editTransaction, form])

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
    }

    onOpenChange(false)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#1a1a1a] border-money-green/10 text-money-light max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-money-light">
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
                            : "bg-white/5 text-muted-foreground hover:bg-white/10"
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

            {/* Category */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">
                    Category
                  </FormLabel>
                  <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
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
                          <Icon className="h-5 w-5" />
                          <span className="text-[10px] leading-tight text-center line-clamp-1">
                            {cat.name.split(" ")[0]}
                          </span>
                        </button>
                      )
                    })}
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
                      className="bg-white/5 border-white/10 text-money-light focus-visible:ring-money-green"
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
                      className="bg-white/5 border-white/10 text-money-light focus-visible:ring-money-green"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Wallet (optional) */}
            {wallets.length > 0 && (
              <FormField
                control={form.control}
                name="walletId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">
                      Wallet <span className="normal-case text-[10px]">(optional)</span>
                    </FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {wallets.map((w) => {
                        const Icon = getIcon(w.icon)
                        const isSelected = field.value === w.id
                        return (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() =>
                              field.onChange(isSelected ? undefined : w.id)
                            }
                            className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all border",
                              isSelected
                                ? "border-current"
                                : "border-transparent text-muted-foreground hover:bg-white/5"
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
                            <Icon className="h-3.5 w-3.5" />
                            <span>{w.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  </FormItem>
                )}
              />
            )}

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
