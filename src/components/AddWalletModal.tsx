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
import {
  useWalletStore,
  type Wallet,
  type WalletType,
  WALLET_TYPE_META,
  WALLET_COLORS,
} from "@/store/walletStore"
import { DynamicIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"

const schema = z.object({
  name: z.string().min(1, "Name is required").max(30),
  type: z.enum(["cash", "bank", "credit", "ewallet"] as const),
  balance: z
    .string()
    .min(1, "Balance is required")
    .refine((v) => !isNaN(parseFloat(v)), "Must be a number"),
  currency: z.string().min(1).max(3),
  color: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

interface AddWalletModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editWallet?: Wallet | null
}

const WALLET_TYPES: WalletType[] = ["cash", "bank", "credit", "ewallet"]

export function AddWalletModal({
  open,
  onOpenChange,
  editWallet,
}: AddWalletModalProps) {
  const addWallet = useWalletStore((s) => s.addWallet)
  const updateWallet = useWalletStore((s) => s.updateWallet)
  const isEditing = !!editWallet

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      type: "cash",
      balance: "0",
      currency: "USD",
      color: WALLET_COLORS[0],
    },
  })

  const selectedType = form.watch("type") as WalletType
  const selectedColor = form.watch("color")

  useEffect(() => {
    if (!open) return
    if (editWallet) {
      form.reset({
        name: editWallet.name,
        type: editWallet.type,
        balance: editWallet.balance.toString(),
        currency: editWallet.currency,
        color: editWallet.color,
      })
    } else {
      form.reset({
        name: "",
        type: "cash",
        balance: "0",
        currency: "USD",
        color: WALLET_COLORS[0],
      })
    }
  }, [open, editWallet, form])

  // Auto-set color when type changes (new wallets only)
  useEffect(() => {
    if (!isEditing) {
      form.setValue("color", WALLET_TYPE_META[selectedType].color)
    }
  }, [selectedType, isEditing, form])

  function onSubmit(values: FormValues) {
    const payload = {
      name: values.name,
      type: values.type,
      balance: parseFloat(values.balance),
      currency: values.currency.toUpperCase(),
      icon: WALLET_TYPE_META[values.type].icon,
      color: values.color,
    }

    if (isEditing && editWallet) {
      updateWallet(editWallet.id, payload)
    } else {
      addWallet(payload)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#1a1a1a] border-money-green/10 text-money-light max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-money-light">
            {isEditing ? "Edit Wallet" : "Add Wallet"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            {/* Wallet Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">
                    Type
                  </FormLabel>
                  <div className="grid grid-cols-4 gap-2">
                    {WALLET_TYPES.map((t) => {
                      const meta = WALLET_TYPE_META[t]
                      const isSelected = field.value === t
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => field.onChange(t)}
                          className={cn(
                            "flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs transition-all border",
                            isSelected
                              ? "border-current"
                              : "border-transparent text-muted-foreground hover:bg-white/5"
                          )}
                          style={
                            isSelected
                              ? {
                                  backgroundColor: `${meta.color}20`,
                                  borderColor: meta.color,
                                  color: meta.color,
                                }
                              : {}
                          }
                        >
                          <DynamicIcon name={meta.icon} className="h-5 w-5" />
                          <span className="text-[10px] font-medium">{meta.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">
                    Name
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">
                        <DynamicIcon
                          name={WALLET_TYPE_META[selectedType].icon}
                          className="h-4 w-4"
                          style={{ color: selectedColor }}
                        />
                      </span>
                      <Input
                        {...field}
                        placeholder={`e.g. ${WALLET_TYPE_META[selectedType].label} Wallet`}
                        className="pl-9 bg-white/5 border-white/10 text-money-light focus-visible:ring-money-green"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Balance + Currency row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="balance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">
                        Balance
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          inputMode="decimal"
                          className="bg-white/5 border-white/10 text-money-light focus-visible:ring-money-green"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">
                      Currency
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="USD"
                        maxLength={3}
                        className="bg-white/5 border-white/10 text-money-light focus-visible:ring-money-green uppercase"
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Color */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">
                    Color
                  </FormLabel>
                  <div className="flex gap-2 flex-wrap">
                    {WALLET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => field.onChange(c)}
                        className={cn(
                          "w-7 h-7 rounded-full transition-all ring-offset-2 ring-offset-[#1a1a1a]",
                          field.value === c && "ring-2 ring-white"
                        )}
                        style={{ backgroundColor: c }}
                        aria-label={c}
                      />
                    ))}
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-money-green text-money-black font-bold h-12 hover:bg-money-green/90"
            >
              {isEditing ? "Save Changes" : "Add Wallet"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
