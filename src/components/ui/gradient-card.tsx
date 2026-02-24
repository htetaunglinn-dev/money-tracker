import { cn } from "@/lib/utils"

interface GradientCardProps extends React.ComponentProps<"div"> {
  glowColor?: string
  glowOpacity?: number
  accentStrip?: string
  variant?: "gradient" | "surface"
  contentClassName?: string
}

export function GradientCard({
  glowColor = "#5DD62C",
  glowOpacity = 0.20,
  accentStrip,
  variant = "gradient",
  contentClassName,
  className,
  children,
  ...props
}: GradientCardProps) {
  const isGradient = variant === "gradient"
  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden",
        isGradient ? "border border-white/5" : "border border-border bg-card",
        className
      )}
      {...props}
    >
      {/* Layer 1: dark gradient base */}
      {isGradient && (
        <div className="absolute inset-0 bg-linear-to-br from-[#1c1c1c] to-[#111111]" />
      )}

      {/* Layer 2: glow blob top-right */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: glowColor, opacity: glowOpacity }}
      />

      {/* Layer 3: accent strip (optional) */}
      {accentStrip && (
        <div
          className="absolute top-0 inset-x-0 h-0.5 z-10"
          style={{ backgroundColor: accentStrip }}
        />
      )}

      {/* Content wrapper — sits above absolute layers */}
      <div className={cn("relative", contentClassName)}>{children}</div>
    </div>
  )
}
