"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { useSession, signOut } from "next-auth/react"
import { Sun, Moon, Monitor, Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { DynamicIcon } from "@/lib/icons"
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  type StoredCategory,
} from "@/lib/data"
import { useSettingsStore, CURRENCY_OPTIONS } from "@/store/settingsStore"
import { GradientCard } from "@/components/ui/gradient-card"

const AVAILABLE_ICONS = [
  "utensils", "car", "shopping-bag", "film", "receipt", "heart",
  "banknote", "briefcase", "trending-up", "coffee", "home", "plane",
  "music", "book", "gift", "phone", "zap", "droplets",
  "wifi", "bus", "train", "bike", "shopping-cart", "gamepad2",
  "shirt", "scissors", "dog", "baby", "graduation-cap", "pill",
  "dumbbell", "wallet", "credit-card", "landmark", "smartphone", "piggy-bank",
]

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#10b981", "#5DD62C",
  "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#6b7280",
]

type CategoryForm = {
  name: string
  icon: string
  color: string
  type: "income" | "expense"
}

const EMPTY_FORM: CategoryForm = { name: "", icon: "utensils", color: "#ef4444", type: "expense" }

// ── Category row sub-component (defined outside to avoid hook-in-render issues) ──
function CategoryRow({
  cat,
  onEdit,
  onDelete,
}: {
  cat: StoredCategory
  onEdit: (cat: StoredCategory) => void
  onDelete: (id: string, name: string) => void
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 group">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${cat.color}20` }}
      >
        <DynamicIcon name={cat.icon} className="h-4 w-4" style={{ color: cat.color }} />
      </div>
      <span className="flex-1 text-sm font-medium text-foreground">{cat.name}</span>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(cat)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-money-green hover:bg-money-green/10 transition-colors"
          aria-label={`Edit ${cat.name}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(cat.id, cat.name)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
          aria-label={`Delete ${cat.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()
  const { displayName, currency, setDisplayName, setCurrency } = useSettingsStore()

  const [nameInput, setNameInput] = useState(displayName)
  // Lazy initializer — reads sessionStorage on client; returns [] during SSR (safe)
  const [categories, setCategories] = useState<StoredCategory[]>(getCategories)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM)

  function openAdd() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  function openEdit(cat: StoredCategory) {
    setEditingId(cat.id)
    setForm({ name: cat.name, icon: cat.icon, color: cat.color, type: cat.type })
    setDialogOpen(true)
  }

  function handleSaveCategory() {
    if (!form.name.trim()) {
      toast.error("Category name is required")
      return
    }
    if (editingId) {
      updateCategory(editingId, form)
      toast.success("Category updated")
    } else {
      addCategory(form)
      toast.success("Category added")
    }
    setCategories(getCategories())
    setDialogOpen(false)
  }

  function handleDeleteCategory(id: string, name: string) {
    deleteCategory(id)
    toast.success(`"${name}" deleted`)
    setCategories(getCategories())
  }

  function handleSaveName() {
    const trimmed = nameInput.trim()
    if (!trimmed) return
    setDisplayName(trimmed)
    toast.success("Display name saved")
  }

  const incomeCategories = categories.filter((c) => c.type === "income")
  const expenseCategories = categories.filter((c) => c.type === "expense")

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto pb-8">
      <h1 className="text-2xl font-bold text-foreground pt-1">Settings</h1>

      {/* ── Appearance ──────────────────────────────────────── */}
      <GradientCard variant="surface" glowColor="#5DD62C" glowOpacity={0.12}>
      <section className="p-5 flex flex-col gap-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Appearance</h2>
        <div className="flex flex-col gap-2">
          <Label>Theme</Label>
          <div className="flex gap-2">
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border text-sm font-medium transition-all ${
                  theme === t
                    ? "border-money-green bg-money-green/10 text-money-green"
                    : "border-border text-muted-foreground hover:border-money-green/40"
                }`}
              >
                {t === "light" && <Sun className="h-4 w-4" />}
                {t === "dark" && <Moon className="h-4 w-4" />}
                {t === "system" && <Monitor className="h-4 w-4" />}
                <span className="capitalize">{t}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
      </GradientCard>

      {/* ── Preferences ─────────────────────────────────────── */}
      <GradientCard variant="surface" glowColor="#5DD62C" glowOpacity={0.12}>
      <section className="p-5 flex flex-col gap-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preferences</h2>

        <div className="flex flex-col gap-2">
          <Label htmlFor="displayName">Display name</Label>
          <div className="flex gap-2">
            <Input
              id="displayName"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your name"
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
            />
            <Button
              onClick={handleSaveName}
              className="bg-money-green text-money-black hover:bg-money-green/90 font-semibold shrink-0"
            >
              Save
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>
      </GradientCard>

      {/* ── Categories ──────────────────────────────────────── */}
      <GradientCard variant="surface" glowColor="#5DD62C" glowOpacity={0.12}>
      <section className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categories</h2>
          <Button
            size="sm"
            onClick={openAdd}
            className="bg-money-green text-money-black hover:bg-money-green/90 font-semibold h-8 px-3"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>

        {expenseCategories.length > 0 && (
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-muted-foreground font-medium px-1 mb-1">Expense</p>
            {expenseCategories.map((cat) => (
              <CategoryRow key={cat.id} cat={cat} onEdit={openEdit} onDelete={handleDeleteCategory} />
            ))}
          </div>
        )}

        {incomeCategories.length > 0 && (
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-muted-foreground font-medium px-1 mb-1">Income</p>
            {incomeCategories.map((cat) => (
              <CategoryRow key={cat.id} cat={cat} onEdit={openEdit} onDelete={handleDeleteCategory} />
            ))}
          </div>
        )}

        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No categories yet. Add one above.</p>
        )}
      </section>
      </GradientCard>

      {/* ── Account ─────────────────────────────────────────── */}
      <GradientCard variant="surface" glowColor="#5DD62C" glowOpacity={0.12}>
      <section className="p-5 flex flex-col gap-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</h2>
        <div className="flex flex-col gap-0.5">
          {session?.user?.name && (
            <p className="text-sm font-medium text-foreground">{session.user.name}</p>
          )}
          <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
        </div>
        <Separator />
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-left text-sm font-medium text-red-400 hover:text-red-300 transition-colors py-1"
        >
          Sign out
        </button>
      </section>
      </GradientCard>

      {/* ── Category add/edit dialog ─────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 pt-1">
            <div className="flex flex-col gap-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Groceries"
                onKeyDown={(e) => e.key === "Enter" && handleSaveCategory()}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Type</Label>
              <div className="flex gap-2">
                {(["expense", "income"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm((f) => ({ ...f, type: t }))}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-all ${
                      form.type === t
                        ? "border-money-green bg-money-green/10 text-money-green"
                        : "border-border text-muted-foreground hover:border-money-green/40"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm((f) => ({ ...f, color: c }))}
                    className="w-7 h-7 rounded-full border-2 transition-all"
                    style={{
                      backgroundColor: c,
                      borderColor: form.color === c ? "#fff" : "transparent",
                      boxShadow: form.color === c ? `0 0 0 2px ${c}` : "none",
                    }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-9 gap-1 max-h-36 overflow-y-auto pr-1">
                {AVAILABLE_ICONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setForm((f) => ({ ...f, icon }))}
                    className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                      form.icon === icon
                        ? "bg-money-green/20 text-money-green ring-1 ring-money-green"
                        : "text-muted-foreground hover:bg-white/10"
                    }`}
                    aria-label={icon}
                  >
                    <DynamicIcon name={icon} className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="ghost" className="flex-1" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveCategory}
                className="flex-1 bg-money-green text-money-black hover:bg-money-green/90 font-semibold"
              >
                {editingId ? "Save changes" : "Add category"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
