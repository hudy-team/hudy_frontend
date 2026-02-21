"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Copy, Eye, EyeOff, Key, Plus, RefreshCw, Power, CreditCard } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface ApiKey {
  id: string
  name: string
  key: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [showCreate, setShowCreate] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [recyclingIds, setRecyclingIds] = useState<Set<string>>(new Set())
  const [showReplaceDialog, setShowReplaceDialog] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(false)

  const fetchKeys = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    const [keysResult, subResult] = await Promise.all([
      supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("subscriptions")
        .select("id")
        .eq("status", "active")
        .limit(1)
        .maybeSingle(),
    ])

    if (keysResult.error) {
      toast.error("API 키 로드 중 오류가 발생했습니다.")
      console.error(keysResult.error)
    } else {
      setKeys(keysResult.data || [])
    }

    setHasSubscription(!!subResult.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchKeys()
  }, [fetchKeys])

  const generateKey = () => {
    return (
      "hd_live_" +
      Array.from(crypto.getRandomValues(new Uint8Array(24)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, 32)
    )
  }

  const toggleVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const maskValue = (value: string) => {
    const prefix = value.slice(0, 12)
    return `${prefix}${"*".repeat(value.length - 12)}`
  }

  const copyKey = async (apiKey: ApiKey) => {
    await navigator.clipboard.writeText(apiKey.key)
    toast.success("API 키가 클립보드에 복사되었습니다.")
  }

  const createKey = async () => {
    if (!newKeyName.trim()) return

    if (!hasSubscription) {
      toast.error("구독이 필요합니다. 먼저 플랜을 구독해주세요.")
      return
    }

    // Check if keys already exist - show confirmation dialog
    if (keys.length > 0) {
      setShowReplaceDialog(true)
      return
    }

    await performCreateKey()
  }

  const performCreateKey = async () => {
    setCreating(true)

    const supabase = createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      toast.error("인증 정보를 확인할 수 없습니다.")
      setCreating(false)
      return
    }

    // Delete all existing keys first
    if (keys.length > 0) {
      const { error: deleteError } = await supabase
        .from("api_keys")
        .delete()
        .eq("user_id", user.id)

      if (deleteError) {
        toast.error("기존 키 삭제 중 오류가 발생했습니다.")
        console.error(deleteError)
        setCreating(false)
        setShowReplaceDialog(false)
        return
      }
    }

    const { error } = await supabase
      .from("api_keys")
      .insert({
        user_id: user.id,
        key: generateKey(),
        name: newKeyName.trim(),
      })

    if (error) {
      toast.error("API 키 생성 중 오류가 발생했습니다.")
      console.error(error)
      setCreating(false)
      setShowReplaceDialog(false)
      return
    }

    toast.success("API 키가 생성되었습니다.")
    await fetchKeys()
    setNewKeyName("")
    setShowCreate(false)
    setCreating(false)
    setShowReplaceDialog(false)
  }

  const recycleKey = async (id: string) => {
    setRecyclingIds((prev) => new Set(prev).add(id))

    const supabase = createClient()
    const { error } = await supabase
      .from("api_keys")
      .update({ key: generateKey() })
      .eq("id", id)

    if (error) {
      toast.error("API 키 재생성 중 오류가 발생했습니다.")
      console.error(error)
    } else {
      toast.success("API 키가 재생성되었습니다. 기존 키는 더 이상 사용할 수 없습니다.")
      setVisibleKeys((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      await fetchKeys()
    }

    setRecyclingIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const toggleActive = async (id: string, currentActive: boolean) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("api_keys")
      .update({ is_active: !currentActive })
      .eq("id", id)

    if (error) {
      toast.error("상태 변경 중 오류가 발생했습니다.")
      console.error(error)
    } else {
      toast.success(currentActive ? "API 키가 비활성화되었습니다." : "API 키가 활성화되었습니다.")
      await fetchKeys()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">API Keys</h1>
          <p className="mt-1 text-sm text-muted-foreground">{"API 키를 생성하고 관리하세요."}</p>
        </div>
        {hasSubscription ? (
          <Button className="gap-2" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            <span className="max-sm:hidden">{"새 키 생성"}</span>
          </Button>
        ) : !loading ? (
          <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-xs">
            <CreditCard className="h-3 w-3" />
            구독 필요
          </Badge>
        ) : null}
      </div>

      {showCreate && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label htmlFor="key-name" className="mb-1.5 block text-sm text-muted-foreground">
                  {"키 이름"}
                </label>
                <input
                  id="key-name"
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Production, Development"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") createKey()
                  }}
                  disabled={creating}
                />
              </div>
              <Button onClick={createKey} disabled={creating}>
                {creating ? "생성 중..." : "생성"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreate(false)}
                className="bg-transparent"
                disabled={creating}
              >
                {"취소"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 animate-pulse rounded-lg bg-primary/10" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-48 animate-pulse rounded bg-muted" />
                      </div>
                    </div>
                  </div>
                  <div className="h-12 animate-pulse rounded-lg bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : keys.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            {hasSubscription ? (
              <>
                <Key className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">API 키가 없습니다</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  새 API 키를 생성하여 HuDy API를 사용하세요.
                </p>
              </>
            ) : (
              <>
                <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">구독이 필요합니다</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  HuDy API를 사용하려면 먼저 플랜을 구독해주세요.
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
      ) : (
        <div className="flex flex-col gap-4">
          {keys.map((apiKey) => {
            const isVisible = visibleKeys.has(apiKey.id)
            const isRecycling = recyclingIds.has(apiKey.id)

            return (
              <Card key={apiKey.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Key className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{apiKey.name}</h3>
                            <Badge
                              variant={apiKey.is_active ? "default" : "secondary"}
                              className="cursor-pointer text-xs"
                              onClick={() => toggleActive(apiKey.id, apiKey.is_active)}
                            >
                              {apiKey.is_active ? "active" : "inactive"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{"생성일: "}{formatDate(apiKey.created_at)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleActive(apiKey.id, apiKey.is_active)}
                        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        aria-label={apiKey.is_active ? "비활성화" : "활성화"}
                        title={apiKey.is_active ? "비활성화" : "활성화"}
                      >
                        <Power className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-3">
                      <code className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-sm text-foreground">
                        {isVisible ? apiKey.key : maskValue(apiKey.key)}
                      </code>
                      <button
                        type="button"
                        onClick={() => toggleVisibility(apiKey.id)}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        aria-label={isVisible ? "키 숨기기" : "키 보기"}
                      >
                        {isVisible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyKey(apiKey)}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        aria-label="키 복사"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => recycleKey(apiKey.id)}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="키 재생성"
                        title="키 재생성 (기존 키 무효화)"
                        disabled={isRecycling}
                      >
                        <RefreshCw className={`h-4 w-4 ${isRecycling ? "animate-spin" : ""}`} />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <AlertDialog open={showReplaceDialog} onOpenChange={setShowReplaceDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>API 키 재발급</AlertDialogTitle>
            <AlertDialogDescription>
              새 키를 발급하면 기존 API 키가 즉시 만료 및 삭제됩니다. 기존 키를 사용 중인 서비스에 영향을 줄 수 있습니다. 계속하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={performCreateKey}
            >
              재발급
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
