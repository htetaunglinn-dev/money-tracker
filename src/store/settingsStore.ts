import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SettingsStore {
  displayName: string
  currency: string
  setDisplayName: (name: string) => void
  setCurrency: (currency: string) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      displayName: "",
      currency: "USD",

      setDisplayName: (name) => set({ displayName: name }),
      setCurrency: (currency) => set({ currency }),
    }),
    { name: "mt-settings" }
  )
)

export const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD — US Dollar",         symbol: "$"  },
  { value: "EUR", label: "EUR — Euro",               symbol: "€"  },
  { value: "GBP", label: "GBP — British Pound",      symbol: "£"  },
  { value: "THB", label: "THB — Thai Baht",           symbol: "฿"  },
  { value: "SGD", label: "SGD — Singapore Dollar",   symbol: "S$" },
  { value: "MYR", label: "MYR — Malaysian Ringgit",  symbol: "RM" },
  { value: "MMK", label: "MMK — Myanmar Kyat",       symbol: "K"  },
]
