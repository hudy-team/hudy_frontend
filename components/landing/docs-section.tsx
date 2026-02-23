"use client"

import { Calendar, Calculator, Check, Hash, Package, Plus, Minus, Cpu } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Helper Components
function EndpointHeader({ method, url }: { method: string; url: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-border bg-secondary/50 px-6 py-4">
      <span className="inline-flex rounded bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary">
        {method}
      </span>
      <span className="font-mono text-sm text-foreground break-all">{url}</span>
    </div>
  )
}

function ParamRow({
  name,
  required,
  description,
}: {
  name: string
  required?: boolean
  description: string
}) {
  return (
    <div className="flex items-start gap-4 rounded-lg bg-secondary/50 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm text-primary">{name}</span>
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
            required
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {required ? "required" : "optional"}
        </span>
      </div>
      <span className="text-sm text-muted-foreground">{description}</span>
    </div>
  )
}

function JsonResponse({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-background p-4 font-mono text-sm leading-relaxed">
      <div className="text-muted-foreground">{children}</div>
    </div>
  )
}

function JsonKey({ k }: { k: string }) {
  return <span className="text-primary">&quot;{k}&quot;</span>
}

function JsonString({ v }: { v: string }) {
  return <span className="text-foreground">&quot;{v}&quot;</span>
}

function JsonNumber({ v }: { v: number | string }) {
  return <span className="text-chart-4">{v}</span>
}

function JsonBool({ v }: { v: boolean }) {
  return <span className="text-chart-4">{v ? "true" : "false"}</span>
}

export function DocsSection() {
  return (
    <section id="docs" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            API Reference
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            간단하고 직관적인 API
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
            RESTful API로 설계되어 어떤 언어에서든 쉽게 연동할 수 있습니다.
          </p>
        </div>

        <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-border bg-card">
          {/* Authentication Section - Shared at top */}
          <div className="border-b border-border px-6 py-4">
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Authentication
            </h4>
            <div className="flex items-center gap-3 rounded-lg bg-secondary/50 px-4 py-3">
              <span className="font-mono text-sm text-primary">x-api-key</span>
              <span className="text-sm text-muted-foreground">
                API 키를 전달합니다. (예: x-api-key: hd_live_xxxx)
              </span>
            </div>
          </div>

          {/* Main Tabs - Level 1 */}
          <Tabs defaultValue="holidays" className="w-full">
            <div className="flex border-b border-border">
              <TabsList className="flex w-full bg-transparent p-0 h-auto">
                <TabsTrigger
                  value="holidays"
                  className="flex-1 rounded-none border-b-2 border-transparent py-4 text-sm font-medium text-muted-foreground transition-colors data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-primary/5 data-[state=active]:shadow-none"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  공휴일 조회
                </TabsTrigger>
                <TabsTrigger
                  value="business-days"
                  className="flex-1 rounded-none border-b-2 border-transparent py-4 text-sm font-medium text-muted-foreground transition-colors data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-primary/5 data-[state=active]:shadow-none"
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  영업일 계산
                  <Badge variant="outline" className="ml-1.5 border-primary/50 text-primary text-[10px]">Pro</Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="mcp"
                  className="flex-1 rounded-none border-b-2 border-transparent py-4 text-sm font-medium text-muted-foreground transition-colors data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-primary/5 data-[state=active]:shadow-none"
                >
                  <Cpu className="mr-2 h-4 w-4" />
                  MCP 연동
                </TabsTrigger>
                <TabsTrigger
                  value="sdk"
                  className="flex-1 rounded-none border-b-2 border-transparent py-4 text-sm font-medium text-muted-foreground transition-colors data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-primary/5 data-[state=active]:shadow-none"
                >
                  <Package className="mr-2 h-4 w-4" />
                  SDK
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Holidays API */}
            <TabsContent value="holidays" className="mt-0">
              <EndpointHeader method="GET" url="https://api.hudy.co.kr/v2/holidays" />

              <div className="px-6 py-4">
                <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Parameters
                </h4>
                <div className="flex flex-col gap-2">
                  <ParamRow
                    name="year"
                    description="조회할 연도 (e.g. 2026)"
                  />
                </div>
              </div>

              <div className="border-t border-border px-6 py-4">
                <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Example Response
                </h4>
                <JsonResponse>
                  <div>{"{"}</div>
                  <div className="pl-4">
                    <JsonKey k="result" />: <JsonBool v={true} />,
                  </div>
                  <div className="pl-4">
                    <JsonKey k="data" />: [
                  </div>
                  <div className="pl-8">{"{"}</div>
                  <div className="pl-12">
                    <JsonKey k="id" />: <JsonString v="1" />,
                  </div>
                  <div className="pl-12">
                    <JsonKey k="name" />: <JsonString v="신정" />,
                  </div>
                  <div className="pl-12">
                    <JsonKey k="date" />: <JsonString v="2026-01-01" />,
                  </div>
                  <div className="pl-12">
                    <JsonKey k="year" />: <JsonNumber v={2026} />,
                  </div>
                  <div className="pl-12">
                    <JsonKey k="month" />: <JsonNumber v={1} />,
                  </div>
                  <div className="pl-12">
                    <JsonKey k="day" />: <JsonNumber v={1} />,
                  </div>
                  <div className="pl-12">
                    <JsonKey k="day_of_week" />: <JsonString v="수요일" />,
                  </div>
                  <div className="pl-12">
                    <JsonKey k="type" />: <JsonString v="public" />
                  </div>
                  <div className="pl-8">{"}"}</div>
                  <div className="pl-4">]</div>
                  <div>{"}"}</div>
                </JsonResponse>
              </div>
            </TabsContent>

            {/* MCP Integration */}
            <TabsContent value="mcp" className="mt-0">
              {/* MCP Server URL */}
              <div className="border-b border-border bg-secondary/50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex rounded bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary">
                    MCP
                  </span>
                  <span className="font-mono text-sm text-foreground">
                    https://www.hudy.co.kr/api/mcp
                  </span>
                </div>
              </div>

              <div className="px-6 py-4">
                <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  설정 방법
                </h4>
                <p className="mb-4 text-sm text-muted-foreground">
                  Claude Desktop, Cursor 등 MCP를 지원하는 AI 도구에서 아래 설정을 추가하세요.
                </p>
              </div>

              <div className="border-t border-border px-6 py-4">
                <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Claude Code
                </h4>
                <p className="mb-3 text-sm text-muted-foreground">
                  터미널에서 아래 명령어를 실행하세요.
                </p>
                <div className="rounded-lg bg-background p-4 font-mono text-sm">
                  <span className="break-all text-muted-foreground">
                    <span className="text-primary">claude</span>{" "}mcp add --transport http -H{" "}
                    <span className="text-foreground">{'"x-api-key: YOUR_API_KEY"'}</span>{" "}
                    <span className="text-chart-4">hudy</span>{" "}
                    <span className="text-foreground">https://www.hudy.co.kr/api/mcp</span>
                  </span>
                </div>
              </div>

              <div className="border-t border-border px-6 py-4">
                <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  JSON Configuration
                </h4>
                <p className="mb-3 text-sm text-muted-foreground">
                  또는 설정 파일에 직접 추가할 수 있습니다.
                </p>
                <JsonResponse>
                  <div>{"{"}</div>
                  <div className="pl-4"><JsonKey k="mcpServers" />: {"{"}</div>
                  <div className="pl-8"><JsonKey k="hudy" />: {"{"}</div>
                  <div className="pl-12"><JsonKey k="url" />: <JsonString v="https://www.hudy.co.kr/api/mcp" />,</div>
                  <div className="pl-12"><JsonKey k="headers" />: {"{"}</div>
                  <div className="pl-16"><JsonKey k="x-api-key" />: <JsonString v="hd_live_xxxx" /></div>
                  <div className="pl-12">{"}"}</div>
                  <div className="pl-8">{"}"}</div>
                  <div className="pl-4">{"}"}</div>
                  <div>{"}"}</div>
                </JsonResponse>
              </div>

              <div className="border-t border-border px-6 py-4">
                <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  사용 가능한 도구
                </h4>
                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-4 rounded-lg bg-secondary/50 px-4 py-3">
                    <span className="font-mono text-sm text-primary">get_holidays</span>
                    <span className="text-sm text-muted-foreground">공휴일 조회 (연도별, 기간별)</span>
                  </div>
                  <div className="flex items-start gap-4 rounded-lg bg-secondary/50 px-4 py-3">
                    <span className="font-mono text-sm text-primary">count_business_days</span>
                    <span className="text-sm text-muted-foreground">영업일 수 계산</span>
                  </div>
                  <div className="flex items-start gap-4 rounded-lg bg-secondary/50 px-4 py-3">
                    <span className="font-mono text-sm text-primary">add / subtract_business_days</span>
                    <span className="text-sm text-muted-foreground">영업일 더하기 / 빼기</span>
                  </div>
                  <div className="flex items-start gap-4 rounded-lg bg-secondary/50 px-4 py-3">
                    <span className="font-mono text-sm text-primary">check_business_day</span>
                    <span className="text-sm text-muted-foreground">영업일 여부 확인</span>
                  </div>
                  <div className="flex items-start gap-4 rounded-lg bg-secondary/50 px-4 py-3">
                    <span className="font-mono text-sm text-primary">custom_holidays CRUD</span>
                    <span className="text-sm text-muted-foreground">커스텀 공휴일 생성, 조회, 수정, 삭제</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Business Days API - Level 2 Sub-tabs */}
            <TabsContent value="business-days" className="mt-0">
              <Tabs defaultValue="check" className="w-full">
                <div className="px-6 py-4">
                  <TabsList className="grid h-10 w-full grid-cols-4 rounded-lg bg-secondary p-1">
                    <TabsTrigger value="check" className="rounded-md text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Check className="mr-1.5 h-3.5 w-3.5" />
                      체크
                    </TabsTrigger>
                    <TabsTrigger value="count" className="rounded-md text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Hash className="mr-1.5 h-3.5 w-3.5" />
                      기간 조회
                    </TabsTrigger>
                    <TabsTrigger value="add" className="rounded-md text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      더하기
                    </TabsTrigger>
                    <TabsTrigger value="subtract" className="rounded-md text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Minus className="mr-1.5 h-3.5 w-3.5" />
                      빼기
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Check Business Day */}
                <TabsContent value="check" className="mt-0">
                  <EndpointHeader
                    method="GET"
                    url="https://api.hudy.co.kr/v2/business-days/check"
                  />

                  <div className="px-6 py-4">
                    <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Parameters
                    </h4>
                    <div className="flex flex-col gap-2">
                      <ParamRow
                        name="day"
                        description="확인할 날짜 (YYYY-MM-DD). 미지정 시 오늘"
                      />
                    </div>
                  </div>

                  <div className="border-t border-border px-6 py-4">
                    <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Example Response
                    </h4>
                    <JsonResponse>
                      <div>{"{"}</div>
                      <div className="pl-4">
                        <JsonKey k="result" />: <JsonBool v={true} />,
                      </div>
                      <div className="pl-4">
                        <JsonKey k="data" />: {"{"}
                      </div>
                      <div className="pl-8">
                        <JsonKey k="date" />: <JsonString v="2026-02-17" />,
                      </div>
                      <div className="pl-8">
                        <JsonKey k="is_business_day" />: <JsonBool v={true} />,
                      </div>
                      <div className="pl-8">
                        <JsonKey k="day_of_week" />: <JsonString v="화요일" />
                      </div>
                      <div className="pl-4">{"}"}</div>
                      <div>{"}"}</div>
                    </JsonResponse>
                  </div>
                </TabsContent>

                {/* Count Business Days */}
                <TabsContent value="count" className="mt-0">
                  <EndpointHeader
                    method="GET"
                    url="https://api.hudy.co.kr/v2/business-days/count"
                  />

                  <div className="px-6 py-4">
                    <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Parameters
                    </h4>
                    <div className="flex flex-col gap-2">
                      <ParamRow
                        name="from"
                        required
                        description="시작 날짜 (YYYY-MM-DD)"
                      />
                      <ParamRow
                        name="to"
                        required
                        description="종료 날짜 (YYYY-MM-DD)"
                      />
                    </div>
                  </div>

                  <div className="border-t border-border px-6 py-4">
                    <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Example Response
                    </h4>
                    <JsonResponse>
                      <div>{"{"}</div>
                      <div className="pl-4">
                        <JsonKey k="result" />: <JsonBool v={true} />,
                      </div>
                      <div className="pl-4">
                        <JsonKey k="data" />: {"{"}
                      </div>
                      <div className="pl-8">
                        <JsonKey k="from" />: <JsonString v="2026-01-01" />,
                      </div>
                      <div className="pl-8">
                        <JsonKey k="to" />: <JsonString v="2026-01-31" />,
                      </div>
                      <div className="pl-8">
                        <JsonKey k="business_days" />: <JsonNumber v={21} />,
                      </div>
                      <div className="pl-8">
                        <JsonKey k="total_days" />: <JsonNumber v={31} />,
                      </div>
                      <div className="pl-8">
                        <JsonKey k="holidays_in_range" />: <JsonNumber v={1} />
                      </div>
                      <div className="pl-4">{"}"}</div>
                      <div>{"}"}</div>
                    </JsonResponse>
                  </div>
                </TabsContent>

                {/* Add Business Days */}
                <TabsContent value="add" className="mt-0">
                  <EndpointHeader
                    method="GET"
                    url="https://api.hudy.co.kr/v2/business-days/add"
                  />

                  <div className="px-6 py-4">
                    <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Parameters
                    </h4>
                    <div className="flex flex-col gap-2">
                      <ParamRow
                        name="from"
                        required
                        description="기준 날짜 (YYYY-MM-DD)"
                      />
                      <ParamRow
                        name="days"
                        required
                        description="더할 영업일 수 (1-3650)"
                      />
                    </div>
                  </div>

                  <div className="border-t border-border px-6 py-4">
                    <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Example Response
                    </h4>
                    <JsonResponse>
                      <div>{"{"}</div>
                      <div className="pl-4">
                        <JsonKey k="result" />: <JsonBool v={true} />,
                      </div>
                      <div className="pl-4">
                        <JsonKey k="data" />: {"{"}
                      </div>
                      <div className="pl-8">
                        <JsonKey k="from" />: <JsonString v="2026-02-15" />,
                      </div>
                      <div className="pl-8">
                        <JsonKey k="days" />: <JsonNumber v={10} />,
                      </div>
                      <div className="pl-8">
                        <JsonKey k="result_date" />: <JsonString v="2026-03-03" />
                      </div>
                      <div className="pl-4">{"}"}</div>
                      <div>{"}"}</div>
                    </JsonResponse>
                  </div>
                </TabsContent>

                {/* Subtract Business Days */}
                <TabsContent value="subtract" className="mt-0">
                  <EndpointHeader
                    method="GET"
                    url="https://api.hudy.co.kr/v2/business-days/subtract"
                  />

                  <div className="px-6 py-4">
                    <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Parameters
                    </h4>
                    <div className="flex flex-col gap-2">
                      <ParamRow
                        name="from"
                        required
                        description="기준 날짜 (YYYY-MM-DD)"
                      />
                      <ParamRow
                        name="days"
                        required
                        description="뺄 영업일 수 (1-3650)"
                      />
                    </div>
                  </div>

                  <div className="border-t border-border px-6 py-4">
                    <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Example Response
                    </h4>
                    <JsonResponse>
                      <div>{"{"}</div>
                      <div className="pl-4">
                        <JsonKey k="result" />: <JsonBool v={true} />,
                      </div>
                      <div className="pl-4">
                        <JsonKey k="data" />: {"{"}
                      </div>
                      <div className="pl-8">
                        <JsonKey k="from" />: <JsonString v="2026-02-15" />,
                      </div>
                      <div className="pl-8">
                        <JsonKey k="days" />: <JsonNumber v={5} />,
                      </div>
                      <div className="pl-8">
                        <JsonKey k="result_date" />: <JsonString v="2026-02-06" />
                      </div>
                      <div className="pl-4">{"}"}</div>
                      <div>{"}"}</div>
                    </JsonResponse>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* SDK */}
            <TabsContent value="sdk" className="mt-0">
              <Tabs defaultValue="npm" className="w-full">
                <div className="px-6 py-4">
                  <TabsList className="grid h-10 w-full grid-cols-2 rounded-lg bg-secondary p-1">
                    <TabsTrigger value="npm" className="rounded-md text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Node.js / TypeScript
                    </TabsTrigger>
                    <TabsTrigger value="pypi" className="rounded-md text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Python
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="npm" className="mt-0">
                  <div className="border-t border-border px-6 py-4">
                    <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Installation
                    </h4>
                    <div className="rounded-lg bg-background p-4 font-mono text-sm">
                      <span className="text-primary">npm</span>{" "}
                      <span className="text-muted-foreground">install</span>{" "}
                      <span className="text-foreground">@hudy-sdk/sdk</span>
                    </div>
                  </div>

                  <div className="border-t border-border px-6 py-4">
                    <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Quick Start
                    </h4>
                    <div className="rounded-lg bg-background p-4 font-mono text-sm leading-relaxed">
                      <div className="text-muted-foreground">
                        <div>
                          <span className="text-primary">import</span>{" "}
                          {"{ HudyClient }"}{" "}
                          <span className="text-primary">from</span>{" "}
                          <span className="text-foreground">{`'@hudy-sdk/sdk'`}</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-primary">const</span>{" "}
                          {"client = "}
                          <span className="text-primary">new</span>{" "}
                          <span className="text-foreground">HudyClient</span>
                          {"({ apiKey: "}
                          <span className="text-foreground">{`'hd_live_xxxx'`}</span>
                          {" })"}
                        </div>
                        <div className="mt-2">
                          <span className="text-muted-foreground/60">{"// 공휴일 조회"}</span>
                        </div>
                        <div>
                          <span className="text-primary">const</span>{" "}
                          {"holidays = "}
                          <span className="text-primary">await</span>{" "}
                          {"client."}
                          <span className="text-foreground">getHolidays</span>
                          {"("}
                          <span className="text-chart-4">2026</span>
                          {")"}
                        </div>
                        <div className="mt-2">
                          <span className="text-muted-foreground/60">{"// 영업일 체크"}</span>
                        </div>
                        <div>
                          <span className="text-primary">const</span>{" "}
                          {"result = "}
                          <span className="text-primary">await</span>{" "}
                          {"client."}
                          <span className="text-foreground">isBusinessDay</span>
                          {"("}
                          <span className="text-primary">new</span>{" "}
                          <span className="text-foreground">Date</span>
                          {"("}
                          <span className="text-foreground">{`'2026-02-17'`}</span>
                          {"))"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border px-6 py-4">
                    <a
                      href="https://www.npmjs.com/package/@hudy-sdk/sdk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      npm에서 자세히 보기 →
                    </a>
                  </div>
                </TabsContent>

                <TabsContent value="pypi" className="mt-0">
                  <div className="border-t border-border px-6 py-4">
                    <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Installation
                    </h4>
                    <div className="rounded-lg bg-background p-4 font-mono text-sm">
                      <span className="text-primary">pip</span>{" "}
                      <span className="text-muted-foreground">install</span>{" "}
                      <span className="text-foreground">hudy-sdk</span>
                    </div>
                  </div>

                  <div className="border-t border-border px-6 py-4">
                    <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Quick Start
                    </h4>
                    <div className="rounded-lg bg-background p-4 font-mono text-sm leading-relaxed">
                      <div className="text-muted-foreground">
                        <div>
                          <span className="text-primary">from</span>{" "}
                          {"datetime "}
                          <span className="text-primary">import</span>{" "}
                          <span className="text-foreground">date</span>
                        </div>
                        <div>
                          <span className="text-primary">from</span>{" "}
                          {"hudy "}
                          <span className="text-primary">import</span>{" "}
                          <span className="text-foreground">HudyClient</span>
                        </div>
                        <div className="mt-2">
                          {"client = "}
                          <span className="text-foreground">HudyClient</span>
                          {"(api_key="}
                          <span className="text-foreground">{`"hd_live_xxxx"`}</span>
                          {")"}
                        </div>
                        <div className="mt-2">
                          <span className="text-muted-foreground/60">{"# 공휴일 조회"}</span>
                        </div>
                        <div>
                          {"holidays = client."}
                          <span className="text-foreground">get_holidays</span>
                          {"("}
                          <span className="text-chart-4">2026</span>
                          {")"}
                        </div>
                        <div className="mt-2">
                          <span className="text-muted-foreground/60">{"# 영업일 체크"}</span>
                        </div>
                        <div>
                          {"result = client."}
                          <span className="text-foreground">is_business_day</span>
                          {"(date("}
                          <span className="text-chart-4">2026</span>
                          {", "}
                          <span className="text-chart-4">2</span>
                          {", "}
                          <span className="text-chart-4">17</span>
                          {"))"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border px-6 py-4">
                    <a
                      href="https://pypi.org/project/hudy-sdk/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      PyPI에서 자세히 보기 →
                    </a>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}
