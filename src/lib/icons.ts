import React from "react"
import type { LucideIcon } from "lucide-react"
import {
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Receipt,
  Heart,
  Banknote,
  Briefcase,
  TrendingUp,
  Circle,
  Coffee,
  Home,
  Plane,
  Music,
  Book,
  Gift,
  Phone,
  Zap,
  Droplets,
  Wifi,
  Bus,
  Train,
  Bike,
  ShoppingCart,
  Gamepad2,
  Shirt,
  Scissors,
  Dog,
  Baby,
  GraduationCap,
  Pill,
  Dumbbell,
  Wallet,
  CreditCard,
  Landmark,
  Smartphone,
  PiggyBank,
  Target,
} from "lucide-react"

const ICON_MAP: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  "shopping-bag": ShoppingBag,
  film: Film,
  receipt: Receipt,
  heart: Heart,
  banknote: Banknote,
  briefcase: Briefcase,
  "trending-up": TrendingUp,
  coffee: Coffee,
  home: Home,
  plane: Plane,
  music: Music,
  book: Book,
  gift: Gift,
  phone: Phone,
  zap: Zap,
  droplets: Droplets,
  wifi: Wifi,
  bus: Bus,
  train: Train,
  bike: Bike,
  "shopping-cart": ShoppingCart,
  gamepad2: Gamepad2,
  shirt: Shirt,
  scissors: Scissors,
  dog: Dog,
  baby: Baby,
  "graduation-cap": GraduationCap,
  pill: Pill,
  dumbbell: Dumbbell,
  wallet: Wallet,
  "credit-card": CreditCard,
  landmark: Landmark,
  smartphone: Smartphone,
  "piggy-bank": PiggyBank,
  target: Target,
}

export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Circle
}

/**
 * Renders a Lucide icon by name without creating a component during render.
 * Use this instead of `const Icon = getIcon(name); <Icon />` inside components.
 */
export function DynamicIcon({
  name,
  ...props
}: { name: string } & React.ComponentPropsWithoutRef<"svg">): React.ReactElement {
  return React.createElement(getIcon(name), props)
}
