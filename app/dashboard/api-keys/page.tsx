"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Eye, EyeOff, Key, Plus, Trash2 } from "lucide-react"

interface ApiKey {
  id: string
  name: string
  key: string
  created: string
  lastUsed: string
  status: "active" | "revoked"
  calls: number
}

const initialKeys: ApiKey[] = [
  {
    id: "1",
    name: "Production",
    key: "hd_live_a8f2k9x1m3p7q5w0e6r4t8y2u0i3o5",
    created: "2025-11-15",
    lastUsed: "2 minutes ago",
    status: "active",
    calls: 142300,
  },
  {
    id: "2",
    name: "Development",
    key: "hd_test_b3g7h1j5l9n2q6s0v4x8z2c6f0i4k8m",
    created: "2025-12-03",
    lastUsed: "1 hour ago",
    status: "active",
    calls: 23400,
  },
  {
    id: "3",
    name: "Staging",
    key: "hd_test_d5f9h3j7l1n5p9r3t7v1x5z9b3d7f1h",
    created: "2026-01-10",
    lastUsed: "3 days ago",
    status: "active",
    calls: 1900,
  },
]

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [showCreate, setShowCreate] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")

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
  }

  const createKey = () => {
    if (!newKeyName.trim()) return
    const newKey: ApiKey = {
      id: String(Date.now()),
      name: newKeyName,
      key: `hd_live_${Array.from({ length: 32 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("")}`,
      created: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
      status: "active",
      calls: 0,
    }
    setKeys((prev) => [newKey, ...prev])
    setNewKeyName("")
    setShowCreate(false)
  }

  const revokeKey = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id))
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
                />
              </div>
              <Button onClick={createKey}>{"생성"}</Button>
              <Button variant="outline" onClick={() => setShowCreate(false)} className="bg-transparent">
                {"취소"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                        <Badge variant={apiKey.status === "active" ? "default" : "destructive"} className="text-xs">
                          {apiKey.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {"Created "}{apiKey.created}{" | Last used "}{apiKey.lastUsed}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{apiKey.calls.toLocaleString()} calls</span>
                  </div>
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
                    onClick={() => revokeKey(apiKey.id)}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Revoke key"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
