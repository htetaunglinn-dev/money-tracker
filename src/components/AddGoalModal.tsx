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
import { useSavingsStore, type SavingsGoal } from "@/store/savingsStore"
import { WALLET_COLORS } from "@/store/walletStore"
import { DynamicIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"

const GOAL_ICONS = [
  { key: "piggy-bank", label: "Savings" },
  { key: "home", label: "Home" },
  { key: "plane", label: "Travel" },
  { key: "graduation-cap", label: "Education" },
  { key: "car", label: "Car" },
  { key: "heart", label: "Health" },
  { key: "gift", label: "Gift" },
  { key: "target", label: "Goal" },
] as const

const schema = z.object({
  name: z.string().min(1, "Name is required").max(40),
  targetAmount: z
    .string()
    .min(1, "Target is required")
    .refine((v) => parseFloat(v) > 0, "Must be greater than 0"),
  initialAmount: z
    .string()
    .refine(
      (v) => v === "" || !isNaN(parseFloat(v)),
      "Must be a number"
    ),
  deadline: z.string().optional(),
  icon: z.string().min(1),
  color: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

interface AddGoalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editGoal?: SavingsGoal | null
}

export function AddGoalModal({
  open,
  onOpenChange,
  editGoal,
}: AddGoalModalProps) {
  const addGoal = useSavingsStore((s) => s.addGoal)
  const updateGoal = useSavingsStore((s) => s.updateGoal)
  const isEditing = !!editGoal

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      targetAmount: "",
      initialAmount: "0",
      deadline: "",
      icon: "piggy-bank",
      color: WALLET_COLORS[0],
    },
  })

  const selectedIcon = form.watch("icon")
  const selectedColor = form.watch("color")

  useEffect(() => {
    if (!open) return
    if (editGoal) {
      form.reset({
        name: editGoal.name,
        targetAmount: editGoal.targetAmount.toString(),
        initialAmount: editGoal.currentAmount.toString(),
        deadline: editGoal.deadline
          ? new Date(editGoal.deadline).toISOString().split("T")[0]
          : "",
        icon: editGoal.icon,
        color: editGoal.color,
      })
    } else {
      form.reset({
        name: "",
        targetAmount: "",
        initialAmount: "0",
        deadline: "",
        icon: "piggy-bank",
        color: WALLET_COLORS[0],
      })
    }
  }, [open, editGoal, form])

  function onSubmit(values: FormValues) {
    const payload = {
      name: values.name,
      targetAmount: parseFloat(values.targetAmount),
      currentAmount: parseFloat(values.initialAmount || "0"),
      deadline: values.deadline
        ? new Date(values.deadline).toISOString()
        : null,
      icon: values.icon,
      color: values.color,
    }

    if (isEditing && editGoal) {
      updateGoal(editGoal.id, payload)
      toast.success("Goal updated")
    } else {
      addGoal(payload)
      toast.success("Goal created")
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#1a1a1a] border-money-green/10 text-money-light max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-money-light">
            {isEditing ? "Edit Goal" : "New Savings Goal"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            {/* Icon picker */}
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">
                    Icon
                  </FormLabel>
                  <div className="grid grid-cols-4 gap-2">
                    {GOAL_ICONS.map(({ key, label }) => {
                      const isSelected = field.value === key
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => field.onChange(key)}
                          className={cn(
                            "flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs transition-all border",
                            isSelected
                              ? "border-current"
                              : "border-transparent text-muted-foreground hover:bg-white/5"
                          )}
                          style={
                            isSelected
                              ? {
                                  backgroundColor: `${selectedColor}20`,
                                  borderColor: selectedColor,
                                  color: selectedColor,
                                }
                              : {}
                          }
                        >
                          <DynamicIcon name={key} className="h-5 w-5" />
                          <span className="text-[10px] font-medium">{label}</span>
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
                    Goal Name
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">
                        <DynamicIcon
                          name={selectedIcon}
                          className="h-4 w-4"
                          style={{ color: selectedColor }}
                        />
                      </span>
                      <Input
                        {...field}
                        placeholder="e.g. Emergency Fund"
                        className="pl-9 bg-white/5 border-white/10 text-money-light focus-visible:ring-money-green"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Target amount */}
            <FormField
              control={form.control}
              name="targetAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">
                    Target Amount
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">
                        $
                      </span>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-8 h-14 text-2xl font-bold bg-white/5 border-white/10 text-money-light placeholder:text-white/20 focus:border-money-green/50"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Initial saved amount + Deadline row */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="initialAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">
                      Already Saved
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                          $
                        </span>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0"
                          className="pl-6 bg-white/5 border-white/10 text-money-light focus-visible:ring-money-green"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground text-xs uppercase tracking-wider">
                      Deadline (optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        className="bg-white/5 border-white/10 text-money-light focus-visible:ring-money-green scheme-dark"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Color swatches */}
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
              {isEditing ? "Save Changes" : "Create Goal"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
