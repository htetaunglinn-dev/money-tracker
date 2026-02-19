"use client"

import { useEffect, useRef } from "react"
import type { Root } from "@amcharts/amcharts5"

interface Props {
  /** 0–1 ratio of expense / income */
  progress: number
  income: number
  expense: number
}

function ringColor(progress: number) {
  if (progress < 0.7) return "#5DD62C"
  if (progress < 0.9) return "#F59E0B"
  return "#EF4444"
}

const fmtShort = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n)

export function BudgetRing({ progress, income, expense }: Props) {
  const chartRef = useRef<HTMLDivElement>(null)
  const clamped = Math.min(progress, 1)
  const pct = Math.round(clamped * 100)
  const color = ringColor(progress)

  useEffect(() => {
    if (!chartRef.current) return
    let disposed = false
    let root: Root | undefined

    async function init() {
      const am5 = await import("@amcharts/amcharts5")
      const am5percent = await import("@amcharts/amcharts5/percent")
      const AnimatedTheme = (await import("@amcharts/amcharts5/themes/Animated")).default

      if (disposed || !chartRef.current) return

      root = am5.Root.new(chartRef.current)
      root.setThemes([AnimatedTheme.new(root)])

      const chart = root.container.children.push(
        am5percent.PieChart.new(root, {
          radius: am5.percent(100),
          innerRadius: am5.percent(70),
        })
      )

      const series = chart.series.push(
        am5percent.PieSeries.new(root, {
          valueField: "value",
          categoryField: "category",
          tooltip: am5.Tooltip.new(root, { forceHidden: true }),
        })
      )

      series.slices.template.setAll({
        strokeWidth: 3,
        stroke: am5.color(0x202020),
        cornerRadiusTL: 6,
        cornerRadiusTR: 6,
        cornerRadiusBL: 6,
        cornerRadiusBR: 6,
      })

      // Disable hover zoom
      series.slices.template.states.create("hover", { scale: 1 })

      // Per-slice color from data
      series.slices.template.adapters.add("fill", (_fill, target) => {
        const ctx = target.dataItem?.dataContext as { color?: string }
        return ctx?.color ? am5.color(ctx.color) : _fill
      })

      series.labels.template.setAll({ visible: false })
      series.ticks.template.setAll({ visible: false })

      const hasData = income > 0 || expense > 0
      if (hasData) {
        series.data.setAll([
          { category: "Income", value: Math.max(income, 0.01), color: "#5DD62C" },
          { category: "Expense", value: Math.max(expense, 0), color: "#F87171" },
        ])
      } else {
        // Empty state: muted ring
        series.data.setAll([{ category: "Empty", value: 1, color: "#2A2A2A" }])
      }

      series.appear(1000)
      chart.appear(1000, 100)
    }

    init()

    return () => {
      disposed = true
      root?.dispose()
    }
  }, [income, expense])

  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0">
      {/* Chart + center overlay */}
      <div className="relative" style={{ width: 108, height: 108 }}>
        <div ref={chartRef} className="absolute inset-0" />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-lg font-bold leading-none" style={{ color }}>
            {pct}%
          </span>
          <span className="text-[9px] text-muted-foreground mt-0.5 leading-none">used</span>
        </div>
      </div>

      {/* Monthly spending label */}
      <div className="text-center leading-tight">
        <p className="text-[10px] text-muted-foreground">Monthly spending</p>
        <p className="text-xs font-semibold tabular-nums">
          {fmtShort(expense)}{" "}
          <span className="font-normal text-muted-foreground">/ {fmtShort(income)}</span>
        </p>
      </div>
    </div>
  )
}
