"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Activity, ArrowDown, ArrowUp, BarChart3 } from "lucide-react"
import { useMemo } from "react"
import { kstDaysAgoString, kstMonthPrefix } from "@/lib/date"
import {
  FREE_MONTHLY_QUOTA,
  PRO_MONTHLY_QUOTA,
  USAGE_CHART_DAYS,
  USAGE_TABLE_ROWS,
} from "@/lib/plan"

type ApiKey = {
  id: string
  user_id: string
  key: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

type ApiUsageDaily = {
  id: number
  api_key_id: string
  date: string
  call_count: number
  updated_at: string
}

export default function DashboardPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [usageData, setUsageData] = useState<ApiUsageDaily[]>([])
  const [loading, setLoading] = useState(true)
  const [hasPro, setHasPro] = useState(false)

  const monthlyQuota = hasPro ? PRO_MONTHLY_QUOTA : FREE_MONTHLY_QUOTA

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      // Get user's API keys
      const { data: keys, error: keysError } = await supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false })

      if (keysError) {
        console.error("Error fetching API keys:", keysError)
      } else {
        setApiKeys(keys || [])
      }

      // Get daily API usage data for user's keys (최근 USAGE_CHART_DAYS 일)
      const { data: usage, error: usageError } = await supabase
        .from("api_usage_daily")
        .select("*, api_keys!inner(user_id)")
        .gte("date", kstDaysAgoString(USAGE_CHART_DAYS - 1))
        .order("date", { ascending: true })

      if (usageError) {
        console.error("Error fetching usage data:", usageError)
      } else {
        setUsageData(usage || [])
      }

      // Get subscription status
      const { data: subData } = await supabase
        .from("subscriptions")
        .select("id, status")
        .eq("status", "active")
        .limit(1)
        .maybeSingle()

      setHasPro(!!subData)

      setLoading(false)
    }

    fetchData()
  }, [])

  const monthlyUsage = useMemo(() => {
    const yearMonth = kstMonthPrefix()
    return usageData
      .filter((u) => u.date.startsWith(yearMonth))
      .reduce((sum, u) => sum + u.call_count, 0)
  }, [usageData])

  const activeKeys = useMemo(() => {
    return apiKeys.filter((k) => k.is_active).length
  }, [apiKeys])

  // 일별 총 사용량 (최근 USAGE_CHART_DAYS 일, 데이터 없는 날은 0)
  const chartData = useMemo(() => {
    const dateMap = new Map<string, number>()
    for (const u of usageData) {
      dateMap.set(u.date, (dateMap.get(u.date) || 0) + u.call_count)
    }
    return Array.from({ length: USAGE_CHART_DAYS }, (_, i) => {
      const date = kstDaysAgoString(USAGE_CHART_DAYS - 1 - i)
      return { date, calls: dateMap.get(date) || 0 }
    })
  }, [usageData])

  const maxCalls = useMemo(() => {
    const max = Math.max(...chartData.map((d) => d.calls), 0)
    return max > 0 ? max : 1
  }, [chartData])

  const totalChartCalls = useMemo(
    () => chartData.reduce((sum, d) => sum + d.calls, 0),
    [chartData]
  )

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">{"API 사용 현황을 확인하세요."}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-20 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Empty state: no API keys
  if (apiKeys.length === 0) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">{"API 사용 현황을 확인하세요."}</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Activity className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold text-foreground">API 키가 없습니다</h3>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              API 키를 생성하면 사용 현황을 확인할 수 있습니다.
            </p>
            <Button asChild>
              <Link href="/dashboard/api-keys">API 키 생성하기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">{"API 사용 현황을 확인하세요."}</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <StatCard
          title="이번 달 API 사용량"
          value={`${formatNumber(monthlyUsage)} / ${formatNumber(monthlyQuota)}`}
          icon={<BarChart3 className="h-4 w-4 text-primary" />}
          quota={{ used: monthlyUsage, limit: monthlyQuota }}
        />
        <StatCard
          title="활성 키"
          value={activeKeys.toString()}
          icon={<Activity className="h-4 w-4 text-primary" />}
        />
      </div>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              일별 API 사용량{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (최근 {USAGE_CHART_DAYS}일)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalChartCalls === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                최근 {USAGE_CHART_DAYS}일간 사용량 데이터가 없습니다.
              </p>
            ) : (
              <div className="-mx-2 overflow-x-auto px-2 pb-1">
                <div className="flex items-end gap-1.5" style={{ height: 180 }}>
                  {chartData.map((d) => (
                    <div
                      key={d.date}
                      className="group flex w-7 shrink-0 flex-col items-center gap-2"
                      title={`${d.date} · ${formatNumber(d.calls)}회`}
                    >
                      <span className="text-[10px] tabular-nums text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                        {formatNumber(d.calls)}
                      </span>
                      <div
                        className="w-full rounded-t-md bg-primary/70 transition-all group-hover:bg-primary"
                        style={{
                          height: `${d.calls === 0 ? 2 : Math.max((d.calls / maxCalls) * 140, 6)}px`,
                        }}
                      />
                      <span className="whitespace-nowrap text-[9px] text-muted-foreground">
                        {d.date.slice(5)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            API Usage Summary{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (최근 {USAGE_TABLE_ROWS}건)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usageData.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">
                API 호출 상세 로그는 준비 중입니다.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <th className="pb-3 pr-4">API Key</th>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4 text-right">Call Count</th>
                  </tr>
                </thead>
                <tbody>
                  {usageData.slice(-USAGE_TABLE_ROWS).reverse().map((usage) => {
                    const apiKey = apiKeys.find((k) => k.id === usage.api_key_id)
                    return (
                      <tr key={usage.id} className="border-b border-border last:border-0">
                        <td className="py-3 pr-4 text-sm text-foreground">
                          {apiKey?.name || "Unknown Key"}
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground">
                          {usage.date}
                        </td>
                        <td className="py-3 pr-4 text-right text-sm text-foreground">
                          {formatNumber(usage.call_count)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  change,
  trend,
  icon,
  quota,
}: {
  title: string
  value: string
  change?: string
  trend?: "up" | "down"
  icon: React.ReactNode
  quota?: { used: number; limit: number }
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{title}</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            {icon}
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          {change && trend && (
            <span
              className={`flex items-center text-xs font-medium ${
                trend === "up" ? "text-primary" : "text-chart-4"
              }`}
            >
              {trend === "up" ? <ArrowUp className="mr-0.5 h-3 w-3" /> : <ArrowDown className="mr-0.5 h-3 w-3" />}
              {change}
            </span>
          )}
        </div>
        {quota && (
          <div className="mt-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${
                  quota.used / quota.limit > 0.9 ? "bg-destructive" : "bg-primary"
                }`}
                style={{ width: `${Math.min((quota.used / quota.limit) * 100, 100)}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {Math.round((quota.used / quota.limit) * 100)}% 사용
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
