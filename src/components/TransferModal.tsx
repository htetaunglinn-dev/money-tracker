"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { ArrowDown } from "lucide-react"
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
import { useWalletStore, type Wallet, WALLET_TYPE_META } from "@/store/walletStore"
import { DynamicIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { useCurrencySymbol, useFmtCurrency } from "@/store/settingsStore"

const fmtCurrency = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n)

const schema = z.object({
  fromId: z.string().min(1, "Select source wallet"),
  toId: z.string().min(1, "Select destination wallet"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => parseFloat(v) > 0, "Must be greater than 0"),
})

type FormValues = z.infer<typeof schema>

interface TransferModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultFromWallet?: Wallet | null
}

function WalletOption({
  wallet,
  selected,
  onClick,
}: {
  wallet: Wallet
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border",
        selected ? "border-current" : "border-transparent hover:bg-white/5"
      )}
      style={
        selected
          ? {
              backgroundColor: `${wallet.color}1a`,
              borderColor: wallet.color,
              color: wallet.color,
            }
          : { color: "var(--muted-foreground)" }
      }
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{
          backgroundColor: `${wallet.color}20`,
          border: `1px solid ${wallet.color}33`,
        }}
      >
        <DynamicIcon name={wallet.icon} className="h-4 w-4" style={{ color: wallet.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate", selected ? "" : "text-foreground")}>
          {wallet.name}
        </p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {WALLET_TYPE_META[wallet.type].label}
        </p>
      </div>
      <span className={cn("text-sm font-semibold tabular-nums", wallet.balance < 0 ? "text-red-400" : "")}>
        {fmtCurrency(wallet.balance, wallet.currency)}
      </span>
    </button>
  )
}

export function TransferModal({
  open,
  onOpenChange,
  defaultFromWallet,
}: TransferModalProps) {
  const symbol = useCurrencySymbol()
  const fmt = useFmtCurrency()
  const { wallets, transfer } = useWalletStore()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fromId: "", toId: "", amount: "" },
  })

  const fromId = form.watch("fromId")
  const toId = form.watch("toId")

  useEffect(() => {
    if (!open) return
    form.reset({
      fromId: defaultFromWallet?.id ?? "",
      toId: "",
      amount: "",
    })
  }, [open, defaultFromWallet, form])

  function onSubmit(values: FormValues) {
    if (values.fromId === values.toId) {
      form.setError("toId", { message: "Choose a different destination" })
      return
    }
    const fromWallet = wallets.find((w) => w.id === values.fromId)
    const amount = parseFloat(values.amount)
    if (fromWallet && fromWallet.balance < amount) {
      form.setError("amount", { message: "Insufficient balance" })
      return
    }
    transfer(values.fromId, values.toId, amount)
    toast.success(`Transferred ${fmt(amount)} successfully`)
    onOpenChange(false)
  }

  if (wallets.length < 2) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-[#1a1a1a] border-money-green/10 text-money-light">
          <DialogHeader>
            <DialogTitle className="text-money-light">Transfer</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground text-center py-6">
            You need at least 2 wallets to transfer between them.
          </p>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#1a1a1a] border-money-green/10 text-money-light max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-money-light">Transfer</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            {/* From */}
            <FormField
              control={form.control}
              name="fromId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">
                    From
                  </FormLabel>
                  <div className="space-y-1.5">
                    {wallets
                      .filter((w) => w.id !== toId)
                      .map((w) => (
                        <WalletOption
                          key={w.id}
                          wallet={w}
                          selected={field.value === w.id}
                          onClick={() => field.onChange(w.id)}
                        />
                      ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Arrow divider */}
            <div className="flex items-center justify-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10">
                <ArrowDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* To */}
            <FormField
              control={form.control}
              name="toId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">
                    To
                  </FormLabel>
                  <div className="space-y-1.5">
                    {wallets
                      .filter((w) => w.id !== fromId)
                      .map((w) => (
                        <WalletOption
                          key={w.id}
                          wallet={w}
                          selected={field.value === w.id}
                          onClick={() => field.onChange(w.id)}
                        />
                      ))}
                  </div>
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
                        className="pl-7 text-2xl font-bold bg-white/5 border-white/10 text-money-light h-14 focus-visible:ring-money-green"
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
              Transfer
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
