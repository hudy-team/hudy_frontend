"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Pencil, Plus, Trash2, X } from "lucide-react"

interface Holiday {
  id: string
  name: string
  date: string
  description: string
  type: "official" | "custom"
}

const officialHolidays: Holiday[] = [
  { id: "o1", name: "신정", date: "2026-01-01", description: "New Year's Day", type: "official" },
  { id: "o2", name: "설날", date: "2026-02-16", description: "Lunar New Year (Day before)", type: "official" },
  { id: "o3", name: "설날", date: "2026-02-17", description: "Lunar New Year", type: "official" },
  { id: "o4", name: "설날", date: "2026-02-18", description: "Lunar New Year (Day after)", type: "official" },
  { id: "o5", name: "삼일절", date: "2026-03-01", description: "Independence Movement Day", type: "official" },
  { id: "o6", name: "어린이날", date: "2026-05-05", description: "Children's Day", type: "official" },
  { id: "o7", name: "부처님 오신 날", date: "2026-05-24", description: "Buddha's Birthday", type: "official" },
  { id: "o8", name: "현충일", date: "2026-06-06", description: "Memorial Day", type: "official" },
  { id: "o9", name: "광복절", date: "2026-08-15", description: "Liberation Day", type: "official" },
  { id: "o10", name: "추석", date: "2026-10-04", description: "Chuseok (Day before)", type: "official" },
  { id: "o11", name: "추석", date: "2026-10-05", description: "Chuseok", type: "official" },
  { id: "o12", name: "추석", date: "2026-10-06", description: "Chuseok (Day after)", type: "official" },
  { id: "o13", name: "개천절", date: "2026-10-03", description: "National Foundation Day", type: "official" },
  { id: "o14", name: "한글날", date: "2026-10-09", description: "Hangul Day", type: "official" },
  { id: "o15", name: "크리스마스", date: "2026-12-25", description: "Christmas Day", type: "official" },
]

const initialCustomHolidays: Holiday[] = [
  { id: "c1", name: "회사 창립기념일", date: "2026-04-15", description: "Company Foundation Day", type: "custom" },
  { id: "c2", name: "워크숍", date: "2026-07-10", description: "Annual Workshop", type: "custom" },
]

export default function HolidaysPage() {
  const [customHolidays, setCustomHolidays] = useState<Holiday[]>(initialCustomHolidays)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", date: "", description: "" })
  const [activeTab, setActiveTab] = useState<"official" | "custom">("official")

  const handleSubmit = () => {
    if (!form.name.trim() || !form.date.trim()) return

    if (editingId) {
      setCustomHolidays((prev) =>
        prev.map((h) =>
          h.id === editingId ? { ...h, ...form } : h
        )
      )
      setEditingId(null)
    } else {
      const newHoliday: Holiday = {
        id: `c${Date.now()}`,
        name: form.name,
        date: form.date,
        description: form.description,
        type: "custom",
      }
      setCustomHolidays((prev) => [...prev, newHoliday])
    }
    setForm({ name: "", date: "", description: "" })
    setShowForm(false)
  }

  const startEdit = (holiday: Holiday) => {
    setEditingId(holiday.id)
    setForm({ name: holiday.name, date: holiday.date, description: holiday.description })
    setShowForm(true)
    setActiveTab("custom")
  }

  const deleteHoliday = (id: string) => {
    setCustomHolidays((prev) => prev.filter((h) => h.id !== id))
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm({ name: "", date: "", description: "" })
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Holidays</h1>
          <p className="mt-1 text-sm text-muted-foreground">{"공휴일 조회 및 커스텀 공휴일을 관리하세요."}</p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setShowForm(true)
            setActiveTab("custom")
          }}
        >
          <Plus className="h-4 w-4" />
          <span className="max-sm:hidden">{"공휴일 추가"}</span>
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">
              {editingId ? "공휴일 수정" : "새 커스텀 공휴일"}
            </CardTitle>
            <button type="button" onClick={cancelForm} className="text-muted-foreground hover:text-foreground" aria-label="Close form">
              <X className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="h-name" className="mb-1.5 block text-sm text-muted-foreground">{"이름"}</label>
                <input
                  id="h-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. 창립기념일"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="h-date" className="mb-1.5 block text-sm text-muted-foreground">{"날짜"}</label>
                <input
                  id="h-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="h-desc" className="mb-1.5 block text-sm text-muted-foreground">{"설명"}</label>
                <input
                  id="h-desc"
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Optional description"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button onClick={handleSubmit}>
                {editingId ? "수정" : "추가"}
              </Button>
              <Button variant="outline" onClick={cancelForm} className="bg-transparent">
                {"취소"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-6 flex gap-1 rounded-lg border border-border bg-card p-1">
        <button
          type="button"
          onClick={() => setActiveTab("official")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "official"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {"법정 공휴일"} ({officialHolidays.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("custom")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "custom"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {"커스텀 공휴일"} ({customHolidays.length})
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {activeTab === "official" &&
          officialHolidays.map((holiday) => (
            <Card key={holiday.id}>
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{holiday.name}</h3>
                    <Badge variant="secondary" className="text-xs">{"법정"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {holiday.date} - {holiday.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}

        {activeTab === "custom" &&
          customHolidays.map((holiday) => (
            <Card key={holiday.id}>
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-4/10">
                  <Calendar className="h-4 w-4 text-chart-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{holiday.name}</h3>
                    <Badge variant="outline" className="text-xs">{"커스텀"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {holiday.date} - {holiday.description}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(holiday)}
                    className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label="Edit holiday"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteHoliday(holiday.id)}
                    className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Delete holiday"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}

        {activeTab === "custom" && customHolidays.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="mb-4 h-12 w-12 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">{"아직 커스텀 공휴일이 없습니다."}</p>
              <Button
                variant="outline"
                className="mt-4 bg-transparent"
                onClick={() => setShowForm(true)}
              >
                {"첫 공휴일 추가하기"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
