"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface TrendPoint {
  month: string
  income: number
  expense: number
}

interface TrendLineChartProps {
  data: TrendPoint[]
  currency?: string
}

function formatTick(value: number, currency: string): string {
  if (value >= 1000) return `${currency}${Math.round(value / 1000)}k`
  return `${currency}${value}`
}

export function TrendLineChart({ data, currency = "$" }: TrendLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="month"
          tick={{ fill: "#6b7280", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#6b7280", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => formatTick(v, currency)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#202020",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          labelStyle={{ color: "#fff", marginBottom: "4px" }}
          formatter={(value: number | undefined) => [
            `${currency}${(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
          ]}
        />
        <Legend
          wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
          formatter={(value: string) => value.charAt(0).toUpperCase() + value.slice(1)}
        />
        <Line
          type="monotone"
          dataKey="income"
          stroke="#5DD62C"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#5DD62C" }}
        />
        <Line
          type="monotone"
          dataKey="expense"
          stroke="#ef4444"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#ef4444" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
