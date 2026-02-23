"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Copy, Cpu, Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface ApiKey {
  id: string
  key: string
  is_active: boolean
}

const freeTools = [
  { name: "get_holidays", desc: "공휴일 조회" },
]

const proTools = [
  { name: "count_business_days", desc: "영업일 수 계산" },
  { name: "add_business_days", desc: "영업일 더하기" },
  { name: "subtract_business_days", desc: "영업일 빼기" },
  { name: "check_business_day", desc: "영업일 여부 확인" },
  { name: "list_custom_holidays", desc: "커스텀 공휴일 목록" },
  { name: "create_custom_holiday", desc: "커스텀 공휴일 생성" },
  { name: "update_custom_holiday", desc: "커스텀 공휴일 수정" },
  { name: "delete_custom_holiday", desc: "커스텀 공휴일 삭제" },
]

export default function McpPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showApiKey, setShowApiKey] = useState(false)

  const fetchKeys = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("api_keys")
      .select("id, key, is_active")
      .order("created_at", { ascending: false })
    setKeys(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchKeys()
  }, [fetchKeys])

  const apiKey = keys.length > 0 ? keys[0].key : "YOUR_API_KEY"

  const maskApiKey = (key: string) => {
    if (key === "YOUR_API_KEY") return key
    const prefix = key.slice(0, 12)
    return `${prefix}${"*".repeat(key.length - 12)}`
  }

  const displayApiKey = showApiKey ? apiKey : maskApiKey(apiKey)

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    toast.success(`${label} 복사되었습니다.`)
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">MCP</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI Agent에서 HuDy API를 바로 사용하세요.
        </p>
      </div>

      {/* 설정 가이드 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Cpu className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">설정 가이드</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                MCP를 지원하는 AI 도구에서 아래 설정을 추가하세요.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="h-32 animate-pulse rounded-lg bg-muted" />
          ) : (
            <Tabs defaultValue="claude-code" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-3">
                <TabsTrigger value="claude-code">Claude Code</TabsTrigger>
                <TabsTrigger value="claude-desktop">Claude Desktop</TabsTrigger>
                <TabsTrigger value="cursor">Cursor</TabsTrigger>
              </TabsList>

              <TabsContent value="claude-code">
                <p className="mb-2 text-xs text-muted-foreground">터미널에서 아래 명령어를 실행하세요.</p>
                <div className="relative rounded-lg border border-border bg-muted/30">
                  <pre className="overflow-x-auto p-4 text-xs">
                    <code className="font-mono text-foreground">
{`claude mcp add --transport http hudy https://www.hudy.co.kr/api/mcp -H "x-api-key: ${displayApiKey}"`}
                    </code>
                  </pre>
                  <div className="absolute right-2 top-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      aria-label={showApiKey ? "API 키 숨기기" : "API 키 보기"}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(
                        `claude mcp add --transport http hudy https://www.hudy.co.kr/api/mcp -H "x-api-key: ${apiKey}"`,
                        "Claude Code 명령어가"
                      )}
                      className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      aria-label="명령어 복사"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="claude-desktop">
                <div className="relative rounded-lg border border-border bg-muted/30">
                  <pre className="overflow-x-auto p-4 text-xs">
                    <code className="font-mono text-foreground">
{`{
  "mcpServers": {
    "hudy": {
      "url": "https://www.hudy.co.kr/api/mcp",
      "headers": {
        "x-api-key": "${displayApiKey}"
      }
    }
  }
}`}
                    </code>
                  </pre>
                  <div className="absolute right-2 top-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      aria-label={showApiKey ? "API 키 숨기기" : "API 키 보기"}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(
                        JSON.stringify({
                          mcpServers: {
                            hudy: {
                              url: "https://www.hudy.co.kr/api/mcp",
                              headers: { "x-api-key": apiKey }
                            }
                          }
                        }, null, 2),
                        "Claude Desktop 설정이"
                      )}
                      className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      aria-label="설정 복사"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="cursor">
                <div className="relative rounded-lg border border-border bg-muted/30">
                  <pre className="overflow-x-auto p-4 text-xs">
                    <code className="font-mono text-foreground">
{`{
  "mcpServers": {
    "hudy": {
      "url": "https://www.hudy.co.kr/api/mcp",
      "headers": {
        "x-api-key": "${displayApiKey}"
      }
    }
  }
}`}
                    </code>
                  </pre>
                  <div className="absolute right-2 top-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      aria-label={showApiKey ? "API 키 숨기기" : "API 키 보기"}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(
                        JSON.stringify({
                          mcpServers: {
                            hudy: {
                              url: "https://www.hudy.co.kr/api/mcp",
                              headers: { "x-api-key": apiKey }
                            }
                          }
                        }, null, 2),
                        "Cursor 설정이"
                      )}
                      className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      aria-label="설정 복사"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* 사용 가능한 도구 */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">사용 가능한 도구</h2>

          {/* Free */}
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">Free</Badge>
              <span className="text-xs text-muted-foreground">모든 플랜에서 사용 가능</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {freeTools.map((tool) => (
                <div key={tool.name} className="flex items-start gap-2 text-sm">
                  <span className="text-primary">•</span>
                  <div>
                    <code className="font-mono text-foreground">{tool.name}</code>
                    <span className="text-muted-foreground"> — {tool.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="my-4 border-t border-border" />

          {/* Pro */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground text-xs">Pro</Badge>
              <span className="text-xs text-muted-foreground">Pro 플랜 전용</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {proTools.map((tool) => (
                <div key={tool.name} className="flex items-start gap-2 text-sm">
                  <span className="text-primary">•</span>
                  <div>
                    <code className="font-mono text-foreground">{tool.name}</code>
                    <span className="text-muted-foreground"> — {tool.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
