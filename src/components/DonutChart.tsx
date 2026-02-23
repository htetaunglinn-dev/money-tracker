"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

interface CategorySlice {
  id: string
  name: string
  color: string
  total: number
  percentage: number
}

interface DonutChartProps {
  data: CategorySlice[]
  currency?: string
}

interface TooltipPayloadItem {
  payload: CategorySlice
}

function CustomTooltip({
  active,
  payload,
  currency,
}: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  currency: string
}) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="bg-money-dark border border-white/10 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-white mb-0.5">{item.name}</p>
      <p className="text-muted-foreground">
        {currency}
        {item.total.toLocaleString(undefined, { maximumFractionDigits: 0 })} &middot; {item.percentage}%
      </p>
    </div>
  )
}

export function DonutChart({ data, currency = "$" }: DonutChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-55 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No expense data for this period</p>
      </div>
    )
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={82}
            paddingAngle={2}
            dataKey="total"
          >
            {data.map((entry) => (
              <Cell key={entry.id} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip currency={currency} />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Custom legend */}
      <div className="space-y-1.5 mt-2">
        {data.slice(0, 5).map((entry) => (
          <div key={entry.id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="shrink-0 w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-muted-foreground truncate">{entry.name}</span>
            </div>
            <span className="text-xs font-medium text-money-light shrink-0">
              {currency}
              {entry.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
