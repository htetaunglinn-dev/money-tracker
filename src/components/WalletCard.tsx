"use client"

import { useState } from "react"
import { GradientCard } from "@/components/ui/gradient-card"
import { MoreVertical, Pencil, Trash2, ArrowLeftRight, Star } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DynamicIcon } from "@/lib/icons"
import { useWalletStore, type Wallet, WALLET_TYPE_META } from "@/store/walletStore"
import { cn } from "@/lib/utils"

const fmtCurrency = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n)

interface WalletCardProps {
  wallet: Wallet
  onEdit: (wallet: Wallet) => void
  onTransfer: (wallet: Wallet) => void
}

export function WalletCard({ wallet, onEdit, onTransfer }: WalletCardProps) {
  const deleteWallet = useWalletStore((s) => s.deleteWallet)
  const setDefaultWallet = useWalletStore((s) => s.setDefaultWallet)
  const defaultWalletId = useWalletStore((s) => s.defaultWalletId)
  const isDefault = defaultWalletId === wallet.id
  const [menuOpen, setMenuOpen] = useState(false)

  const meta = WALLET_TYPE_META[wallet.type]
  const isNegative = wallet.balance < 0

  return (
    <GradientCard
      glowColor={wallet.color}
      glowOpacity={0.22}
      accentStrip={wallet.color}
      className="rounded-xl"
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `${wallet.color}1a`,
                border: `1px solid ${wallet.color}33`,
              }}
            >
              <DynamicIcon name={wallet.icon} className="h-5 w-5" style={{ color: wallet.color }} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-foreground leading-tight">
                  {wallet.name}
                </p>
                {isDefault && (
                  <Star className="h-3 w-3 fill-money-green text-money-green shrink-0" />
                )}
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                {meta.label}
              </p>
            </div>
          </div>

          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-[#1a1a1a] border-money-green/10 text-money-light"
            >
              {!isDefault && (
                <DropdownMenuItem
                  onClick={() => { setDefaultWallet(wallet.id); setMenuOpen(false) }}
                  className="gap-2 cursor-pointer hover:bg-white/5"
                >
                  <Star className="h-4 w-4" />
                  Set as Default
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => { onTransfer(wallet); setMenuOpen(false) }}
                className="gap-2 cursor-pointer hover:bg-white/5"
              >
                <ArrowLeftRight className="h-4 w-4" />
                Transfer
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => { onEdit(wallet); setMenuOpen(false) }}
                className="gap-2 cursor-pointer hover:bg-white/5"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => { deleteWallet(wallet.id); setMenuOpen(false) }}
                className="gap-2 cursor-pointer text-red-400 hover:bg-red-400/10 focus:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Balance */}
        <p
          className={cn(
            "text-2xl font-bold tabular-nums tracking-tight",
            isNegative ? "text-red-400" : "text-foreground"
          )}
        >
          {fmtCurrency(wallet.balance, wallet.currency)}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">
          {wallet.currency} · Balance
        </p>
      </div>
    </GradientCard>
  )
}
