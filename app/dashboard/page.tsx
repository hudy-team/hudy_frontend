"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Activity, ArrowDown, ArrowUp, BarChart3, Clock, Zap } from "lucide-react"
import { useMemo } from "react"

type ApiKey = {
  id: string
  user_id: string
  key: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

type ApiUsage = {
  id: number
  api_key_id: string
  month: string
  call_count: number
  updated_at: string
}

export default function DashboardPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [usageData, setUsageData] = useState<ApiUsage[]>([])
  const [loading, setLoading] = useState(true)

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

      // Get API usage data for user's keys
      const { data: usage, error: usageError } = await supabase
        .from("api_usage")
        .select("*, api_keys!inner(user_id)")
        .order("month", { ascending: true })

      if (usageError) {
        console.error("Error fetching usage data:", usageError)
      } else {
        setUsageData(usage || [])
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  // Compute stats from real data
  const totalCalls = useMemo(() => {
    return usageData.reduce((sum, u) => sum + u.call_count, 0)
  }, [usageData])

  const activeKeys = useMemo(() => {
    return apiKeys.filter((k) => k.is_active).length
  }, [apiKeys])

  // Get last 7 months of usage data for chart
  const chartData = useMemo(() => {
    if (usageData.length === 0) return []

    // Take last 7 months
    const last7Months = usageData.slice(-7)

    return last7Months.map((u) => ({
      month: u.month,
      calls: u.call_count,
    }))
  }, [usageData])

  const maxCalls = useMemo(() => {
    if (chartData.length === 0) return 1
    return Math.max(...chartData.map((d) => d.calls))
  }, [chartData])

  // Format month for display (2026-01 -> Jan)
  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split("-")
    const date = new Date(parseInt(year), parseInt(monthNum) - 1)
    return date.toLocaleDateString("en-US", { month: "short" })
  }

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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
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

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Calls"
          value={formatNumber(totalCalls)}
          icon={<BarChart3 className="h-4 w-4 text-primary" />}
        />
        <StatCard
          title="Avg Response"
          value="—"
          icon={<Clock className="h-4 w-4 text-primary" />}
        />
        <StatCard
          title="Success Rate"
          value="—"
          icon={<Zap className="h-4 w-4 text-primary" />}
        />
        <StatCard
          title="Active Keys"
          value={activeKeys.toString()}
          icon={<Activity className="h-4 w-4 text-primary" />}
        />
      </div>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">API Calls (Monthly)</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-center">
                <p className="text-sm text-muted-foreground">
                  아직 API 사용 내역이 없습니다.
                </p>
              </div>
            ) : (
              <div className="flex items-end gap-3">
                {chartData.map((d) => (
                  <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {d.calls >= 1000 ? `${(d.calls / 1000).toFixed(1)}k` : d.calls}
                    </span>
                    <div
                      className="w-full rounded-t-md bg-primary/80 transition-all hover:bg-primary"
                      style={{ height: `${(d.calls / maxCalls) * 160}px` }}
                    />
                    <span className="text-xs text-muted-foreground">{formatMonth(d.month)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">API Usage Summary</CardTitle>
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
                    <th className="pb-3 pr-4">Month</th>
                    <th className="pb-3 pr-4 text-right">Call Count</th>
                  </tr>
                </thead>
                <tbody>
                  {usageData.slice(-10).reverse().map((usage, i) => {
                    const apiKey = apiKeys.find((k) => k.id === usage.api_key_id)
                    return (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="py-3 pr-4 text-sm text-foreground">
                          {apiKey?.name || "Unknown Key"}
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground">
                          {usage.month}
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
}: {
  title: string
  value: string
  change?: string
  trend?: "up" | "down"
  icon: React.ReactNode
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
      </CardContent>
    </Card>
  )
}
