import type { PublicHoliday } from "@/lib/holidays"
import { Badge } from "@/components/ui/badge"

const MONTH_LABELS = [
  "JAN · 1월",
  "FEB · 2월",
  "MAR · 3월",
  "APR · 4월",
  "MAY · 5월",
  "JUN · 6월",
  "JUL · 7월",
  "AUG · 8월",
  "SEP · 9월",
  "OCT · 10월",
  "NOV · 11월",
  "DEC · 12월",
]

function isWeekendDayOfWeek(dayOfWeek: string): boolean {
  return dayOfWeek.startsWith("토") || dayOfWeek.startsWith("일")
}

function formatMmDd(date: string): string {
  const [, m, d] = date.split("-")
  return `${m}.${d}`
}

interface HolidayListProps {
  holidays: PublicHoliday[]
  todayKst: string
}

export function HolidayList({ holidays, todayKst }: HolidayListProps) {
  const byMonth = new Map<number, PublicHoliday[]>()
  for (const holiday of holidays) {
    const month = Number(holiday.date.slice(5, 7))
    const list = byMonth.get(month) ?? []
    list.push(holiday)
    byMonth.set(month, list)
  }

  const months = Array.from(byMonth.keys()).sort((a, b) => a - b)

  return (
    <div className="flex flex-col gap-8">
      {months.map((month) => (
        <div key={month} className="flex flex-col gap-3">
          <div className="border-b border-border pb-2 font-mono text-sm text-muted-foreground">
            {MONTH_LABELS[month - 1]}
          </div>
          <div className="flex flex-col gap-2">
            {(byMonth.get(month) ?? []).map((holiday) => {
              const isWeekend = isWeekendDayOfWeek(holiday.dayOfWeek)
              const isPast = holiday.date < todayKst
              return (
                <div
                  key={`${holiday.date}-${holiday.name}`}
                  className={`flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3 ${
                    isPast ? "opacity-45" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`font-mono text-sm ${
                        isWeekend ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {formatMmDd(holiday.date)} {holiday.dayOfWeek}
                    </span>
                    <span className="font-semibold text-foreground">{holiday.name}</span>
                  </div>
                  {holiday.isSubstitute && (
                    <Badge className="border-primary/30 bg-primary/10 text-primary" variant="outline">
                      대체
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
