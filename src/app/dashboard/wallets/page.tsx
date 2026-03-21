"use client"

import { useState } from "react"
import { Plus, Wallet, ArrowLeftRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WalletCard } from "@/components/WalletCard"
import { AddWalletModal } from "@/components/AddWalletModal"
import { TransferModal } from "@/components/TransferModal"
import { useWalletStore, type Wallet as WalletType } from "@/store/walletStore"
import { GradientCard } from "@/components/ui/gradient-card"
import { useFmtCurrency } from "@/store/settingsStore"

export default function WalletsPage() {
  const fmtCurrency = useFmtCurrency()
  const wallets = useWalletStore((s) => s.wallets)
  const getTotalBalance = useWalletStore((s) => s.getTotalBalance)

  const [addOpen, setAddOpen] = useState(false)
  const [editWallet, setEditWallet] = useState<WalletType | null>(null)
  const [transferOpen, setTransferOpen] = useState(false)
  const [transferFrom, setTransferFrom] = useState<WalletType | null>(null)

  const totalBalance = getTotalBalance()
  const isNegative = totalBalance < 0

  function handleEdit(wallet: WalletType) {
    setEditWallet(wallet)
    setAddOpen(true)
  }

  function handleTransfer(wallet: WalletType) {
    setTransferFrom(wallet)
    setTransferOpen(true)
  }

  function handleAddClose(open: boolean) {
    setAddOpen(open)
    if (!open) setEditWallet(null)
  }

  function handleTransferClose(open: boolean) {
    setTransferOpen(open)
    if (!open) setTransferFrom(null)
  }

  return (
    <div className="flex flex-col gap-4 max-w-lg mx-auto lg:max-w-2xl">

      {/* Header */}
      <div className="flex items-center justify-between pt-1 shrink-0">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">Wallets</h1>
          <p className="text-xs text-muted-foreground">
            {wallets.length} {wallets.length === 1 ? "wallet" : "wallets"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {wallets.length >= 2 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setTransferFrom(null); setTransferOpen(true) }}
              className="h-8 gap-1.5 border-money-green/20 text-money-green hover:bg-money-green/10 hover:text-money-green"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Transfer
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => setAddOpen(true)}
            className="h-8 gap-1.5 bg-money-green text-money-black font-semibold hover:bg-money-green/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </div>

      {/* Total Balance Banner */}
      {wallets.length > 0 && (
        <GradientCard
          glowColor={isNegative ? "#ef4444" : "#5DD62C"}
          glowOpacity={0.15}
        >
          <div className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Total Balance
            </p>
            <p
              className={`text-3xl font-bold tabular-nums tracking-tight mt-1 ${
                isNegative ? "text-red-400" : "text-money-green"
              }`}
            >
              {fmtCurrency(totalBalance)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Across all wallets
            </p>
          </div>
        </GradientCard>
      )}

      {/* Wallet Grid */}
      {wallets.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {wallets.map((wallet) => (
            <WalletCard
              key={wallet.id}
              wallet={wallet}
              onEdit={handleEdit}
              onTransfer={handleTransfer}
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-money-green/10 border border-money-green/20 flex items-center justify-center">
            <Wallet className="h-8 w-8 text-money-green" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">No wallets yet</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Add your cash, bank accounts, credit cards, and e-wallets to track your total balance.
            </p>
          </div>
          <Button
            onClick={() => setAddOpen(true)}
            className="bg-money-green text-money-black font-bold hover:bg-money-green/90 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Your First Wallet
          </Button>
        </div>
      )}

      <AddWalletModal
        open={addOpen}
        onOpenChange={handleAddClose}
        editWallet={editWallet}
      />
      <TransferModal
        open={transferOpen}
        onOpenChange={handleTransferClose}
        defaultFromWallet={transferFrom}
      />
    </div>
  )
}
