import { create } from "zustand"
import { persist } from "zustand/middleware"

export type WalletType = "cash" | "bank" | "credit" | "ewallet"

export interface Wallet {
  id: string
  name: string
  type: WalletType
  balance: number
  currency: string
  icon: string
  color: string
}

interface WalletStore {
  wallets: Wallet[]
  defaultWalletId: string | null
  addWallet: (wallet: Omit<Wallet, "id">) => void
  updateWallet: (id: string, updates: Partial<Omit<Wallet, "id">>) => void
  deleteWallet: (id: string) => void
  setDefaultWallet: (id: string) => void
  transfer: (fromId: string, toId: string, amount: number) => void
  getTotalBalance: () => number
}

export const WALLET_TYPE_META: Record<
  WalletType,
  { label: string; icon: string; color: string }
> = {
  cash:    { label: "Cash",      icon: "banknote",     color: "#5DD62C" },
  bank:    { label: "Bank",      icon: "landmark",     color: "#3b82f6" },
  credit:  { label: "Credit",    icon: "credit-card",  color: "#8b5cf6" },
  ewallet: { label: "E-Wallet",  icon: "smartphone",   color: "#f59e0b" },
}

export const WALLET_COLORS = [
  "#5DD62C",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#06b6d4",
  "#f97316",
]

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      wallets: [],
      defaultWalletId: null,

      addWallet: (wallet) => {
        const newWallet: Wallet = {
          id: `wallet-${Date.now()}`,
          ...wallet,
        }
        set((s) => ({
          wallets: [...s.wallets, newWallet],
          defaultWalletId: s.defaultWalletId ?? newWallet.id,
        }))
      },

      updateWallet: (id, updates) => {
        set((s) => ({
          wallets: s.wallets.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        }))
      },

      deleteWallet: (id) => {
        set((s) => ({
          wallets: s.wallets.filter((w) => w.id !== id),
          defaultWalletId: s.defaultWalletId === id ? null : s.defaultWalletId,
        }))
      },

      setDefaultWallet: (id) => set({ defaultWalletId: id }),

      transfer: (fromId, toId, amount) => {
        set((s) => ({
          wallets: s.wallets.map((w) => {
            if (w.id === fromId) return { ...w, balance: w.balance - amount }
            if (w.id === toId) return { ...w, balance: w.balance + amount }
            return w
          }),
        }))
      },

      getTotalBalance: () =>
        get().wallets.reduce((sum, w) => sum + w.balance, 0),
    }),
    { name: "mt-wallets" }
  )
)
