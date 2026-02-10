"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Eye, EyeOff, Key, Plus, Trash2, Power } from "lucide-react"
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

  const fetchKeys = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error("API 키 로드 중 오류가 발생했습니다.")
      console.error(error)
    } else {
      setKeys(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchKeys()
  }, [fetchKeys])

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

  const maskKey = (key: string) => {
    return `${key.slice(0, 10)}${"*".repeat(20)}${key.slice(-4)}`
  }

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.success("클립보드에 복사되었습니다.")
  }

  const createKey = async () => {
    if (!newKeyName.trim()) return
    setCreating(true)

    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      toast.error("인증 정보를 확인할 수 없습니다.")
      setCreating(false)
      return
    }

    const randomKey = 'hd_live_' + Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32)

    const { error } = await supabase.from('api_keys').insert({
      user_id: user.id,
      key: randomKey,
      name: newKeyName.trim(),
    })

    if (error) {
      toast.error("API 키 생성 중 오류가 발생했습니다.")
      console.error(error)
    } else {
      toast.success("API 키가 생성되었습니다.")
      await fetchKeys()
      setNewKeyName("")
      setShowCreate(false)
    }

    setCreating(false)
  }

  const toggleActive = async (id: string, currentActive: boolean) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: !currentActive })
      .eq('id', id)

    if (error) {
      toast.error("상태 변경 중 오류가 발생했습니다.")
      console.error(error)
    } else {
      toast.success(currentActive ? "API 키가 비활성화되었습니다." : "API 키가 활성화되었습니다.")
      await fetchKeys()
    }
  }

  const deleteKey = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('api_keys').delete().eq('id', id)

    if (error) {
      toast.error("API 키 삭제 중 오류가 발생했습니다.")
      console.error(error)
    } else {
      toast.success("API 키가 삭제되었습니다.")
      await fetchKeys()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
          {keys.map((apiKey) => (
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
                            className="text-xs cursor-pointer"
                            onClick={() => toggleActive(apiKey.id, apiKey.is_active)}
                          >
                            {apiKey.is_active ? "active" : "inactive"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {"생성일: "}{formatDate(apiKey.created_at)}
                        </p>
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
                      {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                    </code>
                    <button
                      type="button"
                      onClick={() => toggleVisibility(apiKey.id)}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      aria-label={visibleKeys.has(apiKey.id) ? "Hide key" : "Show key"}
                    >
                      {visibleKeys.has(apiKey.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyKey(apiKey.key)}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      aria-label="Copy key"
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
          ))}
        </div>
      )}
    </div>
  )
}
