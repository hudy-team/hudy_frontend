"use client"

import { Calendar, Calculator, Hash, Plus, Minus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Helper Components
function EndpointHeader({ method, url }: { method: string; url: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-border bg-secondary/50 px-6 py-4">
      <span className="inline-flex rounded bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary">
        {method}
      </span>
      <span className="font-mono text-sm text-foreground">{url}</span>
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
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Holidays API */}
            <TabsContent value="holidays" className="mt-0">
              <EndpointHeader method="GET" url="api.hudy.co.kr/v2/holidays" />

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

            {/* Business Days API - Level 2 Sub-tabs */}
            <TabsContent value="business-days" className="mt-0">
              <Tabs defaultValue="count" className="w-full">
                <div className="px-6 py-4">
                  <TabsList className="grid h-10 w-full grid-cols-3 rounded-lg bg-secondary p-1">
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

                {/* Count Business Days */}
                <TabsContent value="count" className="mt-0">
                  <EndpointHeader
                    method="GET"
                    url="api.hudy.co.kr/v1/business-days/count"
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
                    url="api.hudy.co.kr/v1/business-days/add"
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
                    url="api.hudy.co.kr/v1/business-days/subtract"
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
          </Tabs>
        </div>
      </div>
    </section>
  )
}
