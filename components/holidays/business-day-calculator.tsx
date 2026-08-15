"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { addBusinessDays, countBusinessDays } from "@/lib/business-day"

interface BusinessDayCalculatorProps {
  holidays: string[]
  initialDate: string
}

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"]

function weekdayLabel(date: string): string {
  const [y, m, d] = date.split("-").map(Number)
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  return WEEKDAY_LABELS[dow]
}

type Mode = "add" | "count"

export function BusinessDayCalculator({ holidays, initialDate }: BusinessDayCalculatorProps) {
  const [mode, setMode] = useState<Mode>("add")
  const [baseDate, setBaseDate] = useState(initialDate)
  const [days, setDays] = useState(5)
  const [endDate, setEndDate] = useState(initialDate)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleCalculate() {
    setError(null)
    setResult(null)

    if (mode === "add") {
      if (!baseDate || !Number.isInteger(days) || days < 1 || days > 365) {
        setError("기준일과 1~365 사이의 일수를 입력해 주세요.")
        return
      }
      const resultDate = addBusinessDays(baseDate, days, { holidays })
      setResult(`${baseDate} 기준 ${days}영업일 후는 **${resultDate} (${weekdayLabel(resultDate)})** 입니다`)
    } else {
      if (!baseDate || !endDate || baseDate > endDate) {
        setError("시작일과 종료일을 올바르게 입력해 주세요.")
        return
      }
      const n = countBusinessDays(baseDate, endDate, { holidays })
      setResult(`${baseDate} ~ ${endDate} 영업일은 **${n}일** 입니다`)
    }
  }

  function renderResult(text: string) {
    const parts = text.split(/\*\*(.+?)\*\*/g)
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <span key={i} className="font-mono text-primary">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      ),
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-xl font-bold text-foreground">영업일 계산기</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        주말과 공휴일을 제외한 영업일을 계산합니다. HuDy Business Days API 와 동일한 계산입니다.
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">기준일</label>
          <Input
            type="date"
            value={baseDate}
            onChange={(e) => setBaseDate(e.target.value)}
            className="w-auto"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">모드</label>
          <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="add">영업일 더하기</SelectItem>
              <SelectItem value="count">영업일 수 세기</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {mode === "add" ? (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">일수</label>
            <Input
              type="number"
              min={1}
              max={365}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-24"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">종료일</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-auto"
            />
          </div>
        )}

        <Button onClick={handleCalculate}>계산</Button>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-background/60 p-4 text-sm">
        {error ? (
          <span className="text-muted-foreground">{error}</span>
        ) : result ? (
          <span className="text-foreground">{renderResult(result)}</span>
        ) : (
          <span className="text-muted-foreground">입력 후 계산 버튼을 눌러 주세요.</span>
        )}
      </div>

      <p className="mt-4 font-mono text-xs text-muted-foreground">
        이 계산은 `GET /v2/business-days/{mode === "add" ? "add" : "count"}` 호출 결과와 동일합니다.
      </p>
    </div>
  )
}
