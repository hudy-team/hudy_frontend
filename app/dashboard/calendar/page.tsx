"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Calendar, Check, Copy, CreditCard, ExternalLink, RefreshCw, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  type CalendarToken,
  getCalendarToken,
  createCalendarToken,
  regenerateCalendarToken,
  updateIncludeCustom,
  getCalendarUrl,
} from "@/lib/calendar"

export default function CalendarPage() {
  const [token, setToken] = useState<CalendarToken | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(false)
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const [tokenResult, subResult] = await Promise.all([
        getCalendarToken(),
        supabase
          .from("subscriptions")
          .select("id")
          .eq("status", "active")
          .limit(1)
          .maybeSingle(),
      ])
      setToken(tokenResult)
      setHasSubscription(!!subResult.data)
    } catch {
      toast.error("데이터를 불러오는 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreate = async () => {
    setCreating(true)
    try {
      const newToken = await createCalendarToken()
      setToken(newToken)
      toast.success("캘린더 구독 URL이 생성되었습니다.")
    } catch {
      toast.error("토큰 생성 중 오류가 발생했습니다.")
    } finally {
      setCreating(false)
    }
  }

  const handleRegenerate = async () => {
    setRegenerating(true)
    try {
      const newToken = await regenerateCalendarToken()
      setToken(newToken)
      setShowRegenerateDialog(false)
      toast.success("토큰이 재생성되었습니다. 캘린더 앱에서 새 URL로 다시 등록하세요.")
    } catch {
      toast.error("토큰 재생성 중 오류가 발생했습니다.")
    } finally {
      setRegenerating(false)
    }
  }

  const handleToggleCustom = async () => {
    if (!token) return
    try {
      const newValue = !token.include_custom
      await updateIncludeCustom(token.id, newValue)
      setToken({ ...token, include_custom: newValue })
      toast.success(newValue ? "커스텀 공휴일이 포함됩니다." : "커스텀 공휴일이 제외됩니다.")
    } catch {
      toast.error("설정 변경 중 오류가 발생했습니다.")
    }
  }

  const handleCopy = async () => {
    if (!token) return
    await navigator.clipboard.writeText(getCalendarUrl(token.token))
    setCopied(true)
    toast.success("URL이 클립보드에 복사되었습니다.")
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-muted" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="h-64 animate-pulse rounded-lg bg-muted" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Pro 플랜이 아닌 경우
  if (!hasSubscription) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">캘린더 구독</h1>
            <Badge className="bg-primary text-primary-foreground text-xs">Pro</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            공휴일을 캘린더 앱에 자동으로 동기화하세요.
          </p>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Pro 플랜 전용 기능</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              캘린더 구독 기능은 Pro 플랜에서 사용할 수 있습니다.
              Google Calendar, Apple 캘린더, Outlook에서 공휴일을 자동으로 동기화하세요.
            </p>
            <Link href="/dashboard/billing">
              <Button className="mt-6 gap-2">
                <CreditCard className="h-4 w-4" />
                Pro 플랜 시작하기
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">캘린더 구독</h1>
          <Badge className="bg-primary text-primary-foreground text-xs">Pro</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          공휴일을 캘린더 앱에 자동으로 동기화하세요.
        </p>
      </div>

      {/* 구독 URL */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">구독 URL</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                아래 URL을 캘린더 앱에 등록하면 공휴일이 자동으로 동기화됩니다.
              </p>
            </div>
          </div>

          {!token ? (
            <div className="text-center py-8">
              <p className="mb-4 text-sm text-muted-foreground">
                구독 URL을 생성하여 캘린더 앱에서 공휴일을 받아보세요.
              </p>
              <Button onClick={handleCreate} disabled={creating} className="gap-2">
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Calendar className="h-4 w-4" />
                )}
                {creating ? "생성 중..." : "구독 URL 생성"}
              </Button>
            </div>
          ) : (
            <>
              {/* URL 표시 */}
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-3">
                <code className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-sm text-foreground">
                  {getCalendarUrl(token.token)}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label="URL 복사"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* 옵션 + 액션 */}
              <div className="mt-4 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={token.include_custom}
                    onChange={handleToggleCustom}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm text-foreground">커스텀 공휴일 포함</span>
                </label>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  onClick={() => setShowRegenerateDialog(true)}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  토큰 재생성
                </Button>
              </div>

              {/* 토큰 정보 */}
              <div className="mt-4 rounded-lg bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">
                  생성일: {formatDate(token.created_at)}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 연동 가이드 */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">연동 가이드</h2>
          <div className="space-y-6">
            {/* Google Calendar */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <h3 className="font-medium text-foreground">Google Calendar</h3>
                <a
                  href="https://calendar.google.com/calendar/r/settings/addbyurl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                >
                  바로가기 <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <ol className="ml-4 list-decimal space-y-1 text-sm text-muted-foreground">
                <li>Google Calendar 설정으로 이동</li>
                <li>왼쪽 메뉴에서 &quot;다른 캘린더 추가&quot; &gt; &quot;URL로 추가&quot; 클릭</li>
                <li>위 구독 URL을 붙여넣고 &quot;캘린더 추가&quot; 클릭</li>
              </ol>
            </div>

            <div className="border-t border-border" />

            {/* Apple 캘린더 */}
            <div>
              <h3 className="mb-2 font-medium text-foreground">Apple 캘린더</h3>
              <ol className="ml-4 list-decimal space-y-1 text-sm text-muted-foreground">
                <li>캘린더 앱에서 &quot;파일&quot; &gt; &quot;새 캘린더 구독&quot; 클릭</li>
                <li>위 구독 URL을 붙여넣고 &quot;구독&quot; 클릭</li>
                <li>자동 새로고침 주기를 설정</li>
              </ol>
            </div>

            <div className="border-t border-border" />

            {/* Outlook */}
            <div>
              <h3 className="mb-2 font-medium text-foreground">Outlook</h3>
              <ol className="ml-4 list-decimal space-y-1 text-sm text-muted-foreground">
                <li>Outlook 웹에서 캘린더로 이동</li>
                <li>&quot;캘린더 추가&quot; &gt; &quot;인터넷에서 구독&quot; 선택</li>
                <li>위 구독 URL을 붙여넣고 &quot;가져오기&quot; 클릭</li>
              </ol>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">
              캘린더 앱은 보통 12~24시간마다 자동으로 동기화합니다.
              커스텀 공휴일을 추가하거나 수정하면 다음 동기화 시 자동 반영됩니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 토큰 재생성 확인 다이얼로그 */}
      <AlertDialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>토큰 재생성</AlertDialogTitle>
            <AlertDialogDescription>
              토큰을 재생성하면 기존 URL로는 더 이상 동기화되지 않습니다.
              캘린더 앱에서 새 URL로 다시 등록해야 합니다. 계속하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleRegenerate}
              disabled={regenerating}
            >
              {regenerating ? "재생성 중..." : "재생성"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
