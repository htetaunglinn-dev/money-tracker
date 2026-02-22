"use client"

import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface FABProps {
  onClick: () => void
  className?: string
}

export function FAB({ onClick, className }: FABProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-20 right-4 z-50 lg:bottom-6 lg:right-6",
        "h-14 w-14 rounded-full bg-money-green",
        "shadow-lg shadow-money-green/30",
        "flex items-center justify-center",
        "active:scale-95 transition-transform duration-150",
        "hover:bg-money-green/90",
        className
      )}
      aria-label="Add transaction"
    >
      <Plus className="h-7 w-7 text-money-black" strokeWidth={3} />
    </button>
  )
}
