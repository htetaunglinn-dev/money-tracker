"use client"

interface DayData {
  date: string
  total: number
}

interface SpendingCalendarProps {
  data: DayData[]
  year: number
  month: number // 0-indexed
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"]

function getIntensityClass(total: number, maxTotal: number): string {
  if (total === 0) return "bg-white/5 text-white/20"
  const ratio = total / maxTotal
  if (ratio < 0.25) return "bg-money-green/20 text-white/60"
  if (ratio < 0.5) return "bg-money-green/40 text-white"
  if (ratio < 0.75) return "bg-money-green/65 text-white"
  return "bg-money-green text-money-black"
}

export function SpendingCalendar({ data, year, month }: SpendingCalendarProps) {
  const dayMap = Object.fromEntries(data.map((d) => [d.date, d.total]))
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay() // 0 = Sunday
  const maxTotal = Math.max(...data.map((d) => d.total), 1)
  const today = new Date().toISOString().slice(0, 10)

  // Leading empty cells + day cells
  type Cell = { day: number; date: string } | null
  const cells: Cell[] = [
    ...Array.from<Cell>({ length: firstDay }).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1
      const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      return { day: d, date }
    }),
  ]

  return (
    <div>
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {DAY_LABELS.map((label, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-muted-foreground">
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} />
          const total = dayMap[cell.date] ?? 0
          const isToday = cell.date === today
          return (
            <div
              key={cell.date}
              title={total > 0 ? `$${total.toFixed(0)}` : undefined}
              className={[
                "aspect-square rounded-md flex items-center justify-center text-[10px] font-medium transition-colors",
                getIntensityClass(total, maxTotal),
                isToday ? "ring-1 ring-money-green ring-offset-1 ring-offset-[#202020]" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {cell.day}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="text-[10px] text-muted-foreground mr-0.5">Less</span>
        {(
          [
            "bg-white/5",
            "bg-money-green/20",
            "bg-money-green/40",
            "bg-money-green/65",
            "bg-money-green",
          ] as const
        ).map((cls, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${cls}`} />
        ))}
        <span className="text-[10px] text-muted-foreground ml-0.5">More</span>
      </div>
    </div>
  )
}
