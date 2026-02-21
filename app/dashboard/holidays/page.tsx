"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, CreditCard, Pencil, Plus, Trash2, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface PublicHoliday {
  id: number
  name: string
  date: string
  year: number
  month: number
  day: number
  day_of_week: string
}

interface CustomHoliday {
  id: string
  name: string
  date: string
  year: number
  month: number
  day: number
  day_of_week: string
}

const AVAILABLE_YEARS = [2025, 2026, 2027]

export default function HolidaysPage() {
  const [publicHolidays, setPublicHolidays] = useState<PublicHoliday[]>([])
  const [customHolidays, setCustomHolidays] = useState<CustomHoliday[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", date: "" })
  const [activeTab, setActiveTab] = useState<"official" | "custom">("official")
  const [selectedYear, setSelectedYear] = useState(2026)
  const [hasSubscription, setHasSubscription] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      const [pubResult, custResult, subResult] = await Promise.all([
        supabase
          .from('public_holidays')
          .select('*')
          .eq('year', selectedYear)
          .order('date', { ascending: true }),
        supabase
          .from('custom_holidays')
          .select('*')
          .order('date', { ascending: true }),
        supabase
          .from('subscriptions')
          .select('id')
          .eq('status', 'active')
          .limit(1)
          .maybeSingle(),
      ])

      if (pubResult.error) {
        console.error('Error fetching public holidays:', pubResult.error)
        toast.error("법정 공휴일을 불러오는 중 오류가 발생했습니다.")
      } else {
        setPublicHolidays(pubResult.data || [])
      }

      if (custResult.error) {
        console.error('Error fetching custom holidays:', custResult.error)
        toast.error("커스텀 공휴일을 불러오는 중 오류가 발생했습니다.")
      } else {
        setCustomHolidays(custResult.data || [])
      }

      setHasSubscription(!!subResult.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedYear])

  const handleSubmit = async () => {
    if (!hasSubscription) {
      toast.error("구독이 필요합니다. 먼저 플랜을 구독해주세요.")
      return
    }

    if (!form.name.trim() || !form.date) {
      toast.error("이름과 날짜를 입력해주세요.")
      return
    }

    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      toast.error("로그인이 필요합니다.")
      return
    }

    const dateObj = new Date(form.date)
    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

    const holidayData = {
      user_id: user.id,
      name: form.name.trim(),
      date: form.date,
      year: dateObj.getFullYear(),
      month: dateObj.getMonth() + 1,
      day: dateObj.getDate(),
      day_of_week: dayNames[dateObj.getDay()],
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('custom_holidays')
          .update(holidayData)
          .eq('id', editingId)

        if (error) throw error
        toast.success("커스텀 공휴일이 수정되었습니다.")
      } else {
        const { error } = await supabase
          .from('custom_holidays')
          .insert(holidayData)

        if (error) throw error
        toast.success("커스텀 공휴일이 추가되었습니다.")
      }

      // Reset form and refetch data
      setForm({ name: "", date: "" })
      setShowForm(false)
      setEditingId(null)
      fetchData()
    } catch (error) {
      console.error('Error saving custom holiday:', error)
      toast.error("저장 중 오류가 발생했습니다.")
    }
  }

  const startEdit = (holiday: CustomHoliday) => {
    setEditingId(holiday.id)
    setForm({ name: holiday.name, date: holiday.date })
    setShowForm(true)
    setActiveTab("custom")
  }

  const deleteHoliday = async (id: string) => {
    if (!hasSubscription) {
      toast.error("구독이 필요합니다. 먼저 플랜을 구독해주세요.")
      return
    }

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('custom_holidays')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success("커스텀 공휴일이 삭제되었습니다.")
      fetchData()
    } catch (error) {
      console.error('Error deleting custom holiday:', error)
      toast.error("삭제 중 오류가 발생했습니다.")
    }
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm({ name: "", date: "" })
  }

  const formatDateWithDay = (date: string, dayOfWeek: string) => {
    return `${date} (${dayOfWeek})`
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Holidays</h1>
          <p className="mt-1 text-sm text-muted-foreground">{"공휴일 조회 및 커스텀 공휴일을 관리하세요."}</p>
        </div>
        {hasSubscription ? (
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
        ) : !loading ? (
          <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-xs">
            <CreditCard className="h-3 w-3" />
            구독 필요
          </Badge>
        ) : null}
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
            <div className="grid gap-4 sm:grid-cols-2">
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

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1 flex-1 min-w-[300px]">
          <button
            type="button"
            onClick={() => setActiveTab("official")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "official"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {"법정 공휴일"} ({publicHolidays.length})
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

        {activeTab === "official" && (
          <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
            {AVAILABLE_YEARS.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => setSelectedYear(year)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  selectedYear === year
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-4 py-4">
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {activeTab === "official" &&
            publicHolidays.map((holiday) => (
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
                      {formatDateWithDay(holiday.date, holiday.day_of_week)}
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
                      {formatDateWithDay(holiday.date, holiday.day_of_week)}
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
                {hasSubscription ? (
                  <>
                    <Calendar className="mb-4 h-12 w-12 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">{"아직 커스텀 공휴일이 없습니다."}</p>
                    <Button
                      variant="outline"
                      className="mt-4 bg-transparent"
                      onClick={() => setShowForm(true)}
                    >
                      {"첫 공휴일 추가하기"}
                    </Button>
                  </>
                ) : (
                  <>
                    <CreditCard className="mb-4 h-12 w-12 text-muted-foreground/40" />
                    <h3 className="text-lg font-semibold text-foreground">구독이 필요합니다</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      커스텀 공휴일을 관리하려면 먼저 플랜을 구독해주세요.
                    </p>
                    <Button className="mt-4 gap-2" asChild>
                      <a href="/dashboard/billing">
                        <CreditCard className="h-4 w-4" />
                        구독하러 가기
                      </a>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
