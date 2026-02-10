"use client"

import React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, ArrowDown, ArrowUp, BarChart3, Clock, Zap } from "lucide-react"
import { useMemo } from "react"

const usageData = [
  { date: "Jan", calls: 12400 },
  { date: "Feb", calls: 18200 },
  { date: "Mar", calls: 22100 },
  { date: "Apr", calls: 19800 },
  { date: "May", calls: 28300 },
  { date: "Jun", calls: 31200 },
  { date: "Jul", calls: 35600 },
]

const recentCalls = [
  { endpoint: "GET /v2/holidays?year=2026", status: 200, time: "23ms", date: "2 min ago" },
  { endpoint: "GET /v2/holidays?from=2026-03-01&to=2026-03-31", status: 200, time: "18ms", date: "5 min ago" },
  { endpoint: "GET /v2/holidays?year=2025", status: 200, time: "45ms", date: "12 min ago" },
  { endpoint: "GET /v2/holidays?from=2026-01-01&to=2026-06-30", status: 200, time: "21ms", date: "18 min ago" },
  { endpoint: "GET /v2/holidays", status: 200, time: "32ms", date: "25 min ago" },
  { endpoint: "GET /v2/holidays?year=2026", status: 200, time: "28ms", date: "1 hour ago" },
]

export default function DashboardPage() {
  const maxCalls = useMemo(() => Math.max(...usageData.map((d) => d.calls)), [])

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">{"API 사용 현황을 확인하세요."}</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Calls"
          value="167,600"
          change="+12.5%"
          trend="up"
          icon={<BarChart3 className="h-4 w-4 text-primary" />}
        />
        <StatCard
          title="Avg Response"
          value="28ms"
          change="-8.2%"
          trend="down"
          icon={<Clock className="h-4 w-4 text-primary" />}
        />
        <StatCard
          title="Success Rate"
          value="99.8%"
          change="+0.3%"
          trend="up"
          icon={<Zap className="h-4 w-4 text-primary" />}
        />
        <StatCard
          title="Active Keys"
          value="3"
          change="0"
          trend="up"
          icon={<Activity className="h-4 w-4 text-primary" />}
        />
      </div>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">API Calls (Monthly)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              {usageData.map((d) => (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {(d.calls / 1000).toFixed(1)}k
                  </span>
                  <div
                    className="w-full rounded-t-md bg-primary/80 transition-all hover:bg-primary"
                    style={{ height: `${(d.calls / maxCalls) * 160}px` }}
                  />
                  <span className="text-xs text-muted-foreground">{d.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent API Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 pr-4">Endpoint</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Response</th>
                  <th className="pb-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentCalls.map((call, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4 font-mono text-sm text-foreground">{call.endpoint}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
                          call.status < 300
                            ? "bg-primary/10 text-primary"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {call.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-sm text-muted-foreground">{call.time}</td>
                    <td className="py-3 text-sm text-muted-foreground">{call.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
  change: string
  trend: "up" | "down"
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
          <span
            className={`flex items-center text-xs font-medium ${
              trend === "up" ? "text-primary" : "text-chart-4"
            }`}
          >
            {trend === "up" ? <ArrowUp className="mr-0.5 h-3 w-3" /> : <ArrowDown className="mr-0.5 h-3 w-3" />}
            {change}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
