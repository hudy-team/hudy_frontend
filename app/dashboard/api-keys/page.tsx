"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Eye, EyeOff, Key, Loader2, Plus, Trash2, Power } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface ApiKey {
  id: string
  name: string
  key: string
  is_active: boolean
  token_version: number
  created_at: string
  updated_at: string
}

type IssueTokenOptions = {
  showToast?: boolean
  reveal?: boolean
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [issuedTokens, setIssuedTokens] = useState<Record<string, string>>({})
  const [issuingIds, setIssuingIds] = useState<Set<string>>(new Set())
  const [showCreate, setShowCreate] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const fetchKeys = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      toast.error("API 키 로드 중 오류가 발생했습니다.")
      console.error(error)
    } else {
      setKeys(data || [])
      // 키 상태가 바뀌면 기존 JWT는 stale될 수 있으므로 화면 캐시는 비운다.
      setVisibleKeys(new Set())
      setIssuedTokens({})
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchKeys()
  }, [fetchKeys])

  const setIssuing = (id: string, value: boolean) => {
    setIssuingIds((prev) => {
      const next = new Set(prev)
      if (value) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }

  const issueToken = async (id: string, options: IssueTokenOptions = {}) => {
    const { showToast = true, reveal = false } = options

    setIssuing(id, true)
    try {
      const res = await fetch(`/api/dashboard/api-keys/${id}/token`, {
        method: "POST",
      })

      const payload = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(payload?.message || "토큰 발급에 실패했습니다.")
      }

      const token = payload?.token as string | undefined
      if (!token) {
        throw new Error("토큰 응답이 올바르지 않습니다.")
      }

      setIssuedTokens((prev) => ({
        ...prev,
        [id]: token,
      }))

      if (reveal) {
        setVisibleKeys((prev) => {
          const next = new Set(prev)
          next.add(id)
          return next
        })
      }

      if (showToast) {
        toast.success("API 토큰이 발급되었습니다.")
      }

      return token
    } catch (error) {
      const message = error instanceof Error ? error.message : "토큰 발급 중 오류가 발생했습니다."
      toast.error(message)
      return null
    } finally {
      setIssuing(id, false)
    }
  }

  const toggleVisibility = async (apiKey: ApiKey) => {
    const id = apiKey.id

    if (!visibleKeys.has(id) && !issuedTokens[id]) {
      const token = await issueToken(id)
      if (!token) {
        return
      }
    }

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
    if (value.length <= 16) {
      return `${value.slice(0, 4)}${"*".repeat(8)}${value.slice(-4)}`
    }
    return `${value.slice(0, 12)}${"*".repeat(20)}${value.slice(-6)}`
  }

  const copyToken = async (apiKey: ApiKey) => {
    let token: string | null = issuedTokens[apiKey.id] ?? null
    if (!token) {
      token = await issueToken(apiKey.id, { showToast: false })
      if (!token) {
        return
      }
    }

    await navigator.clipboard.writeText(token)
    toast.success("토큰이 클립보드에 복사되었습니다.")
  }

  const createKey = async () => {
    if (!newKeyName.trim()) return
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

    const randomKey =
      "hd_live_" +
      Array.from(crypto.getRandomValues(new Uint8Array(24)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, 32)

    const { data: createdKey, error } = await supabase
      .from("api_keys")
      .insert({
        user_id: user.id,
        key: randomKey,
        name: newKeyName.trim(),
      })
      .select("id")
      .single()

    if (error || !createdKey) {
      toast.error("API 키 생성 중 오류가 발생했습니다.")
      console.error(error)
      setCreating(false)
      return
    }

    toast.success("API 키가 생성되었습니다.")
    await fetchKeys()
    setNewKeyName("")
    setShowCreate(false)
    await issueToken(createdKey.id, { reveal: true })

    setCreating(false)
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
      setIssuedTokens((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      setVisibleKeys((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      await fetchKeys()
    }
  }

  const deleteKey = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("api_keys").delete().eq("id", id)

    if (error) {
      toast.error("API 키 삭제 중 오류가 발생했습니다.")
      console.error(error)
    } else {
      toast.success("API 키가 삭제되었습니다.")
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
        <Button className="gap-2" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          <span className="max-sm:hidden">{"새 키 생성"}</span>
        </Button>
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
            <Key className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">API 키가 없습니다</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              새 API 키를 생성하여 HuDy API를 사용하세요.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {keys.map((apiKey) => {
            const token = issuedTokens[apiKey.id]
            const isVisible = visibleKeys.has(apiKey.id)
            const isIssuing = issuingIds.has(apiKey.id)

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
                        {!token
                          ? "토큰 미발급 (눈 아이콘을 눌러 발급)"
                          : isVisible
                            ? token
                            : maskValue(token)}
                      </code>
                      <button
                        type="button"
                        onClick={() => toggleVisibility(apiKey)}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={isVisible ? "Hide token" : "Show token"}
                        disabled={!apiKey.is_active || isIssuing}
                        title={!apiKey.is_active ? "비활성 키는 토큰 발급 불가" : undefined}
                      >
                        {isIssuing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isVisible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToken(apiKey)}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Copy token"
                        disabled={!apiKey.is_active || isIssuing}
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteKey(apiKey.id)}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Delete key"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
