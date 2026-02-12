export function DocsSection() {
  return (
    <section id="docs" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">API Reference</p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {"간단하고 직관적인 API"}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
            {"RESTful API로 설계되어 어떤 언어에서든 쉽게 연동할 수 있습니다."}
          </p>
        </div>

        <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 border-b border-border bg-secondary/50 px-6 py-4">
            <span className="inline-flex rounded bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary">
              GET
            </span>
            <span className="font-mono text-sm text-foreground">api.hudy.co.kr/v2/holidays</span>
          </div>

          <div className="border-b border-border px-6 py-4">
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Authentication</h4>
            <div className="flex items-center gap-3 rounded-lg bg-secondary/50 px-4 py-3">
              <span className="font-mono text-sm text-primary">x-api-key</span>
              <span className="text-sm text-muted-foreground">{"API 키를 전달합니다. (예: x-api-key: hd_live_xxxx)"}</span>
            </div>
          </div>

          <div className="px-6 py-4">
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Parameters</h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-4 rounded-lg bg-secondary/50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-primary">year</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">optional</span>
                </div>
                <span className="text-sm text-muted-foreground">{"조회할 연도 (e.g. 2026)"}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border px-6 py-4">
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Example Response</h4>
            <div className="rounded-lg bg-background p-4 font-mono text-sm leading-relaxed">
              <div className="text-muted-foreground">
                <div>{"{"}</div>
                <div className="pl-4">
                  <span className="text-primary">{'"result"'}</span>: <span className="text-chart-4">{"true"}</span>,
                </div>
                <div className="pl-4">
                  <span className="text-primary">{'"data"'}</span>: [
                </div>
                <div className="pl-8">{"{"}</div>
                <div className="pl-12">
                  <span className="text-primary">{'"id"'}</span>: <span className="text-foreground">{'"1"'}</span>,
                </div>
                <div className="pl-12">
                  <span className="text-primary">{'"name"'}</span>: <span className="text-foreground">{'"신정"'}</span>,
                </div>
                <div className="pl-12">
                  <span className="text-primary">{'"date"'}</span>: <span className="text-foreground">{'"2026-01-01"'}</span>,
                </div>
                <div className="pl-12">
                  <span className="text-primary">{'"year"'}</span>: <span className="text-chart-4">{"2026"}</span>,
                </div>
                <div className="pl-12">
                  <span className="text-primary">{'"month"'}</span>: <span className="text-chart-4">{"1"}</span>,
                </div>
                <div className="pl-12">
                  <span className="text-primary">{'"day"'}</span>: <span className="text-chart-4">{"1"}</span>,
                </div>
                <div className="pl-12">
                  <span className="text-primary">{'"day_of_week"'}</span>: <span className="text-foreground">{'"수"'}</span>,
                </div>
                <div className="pl-12">
                  <span className="text-primary">{'"type"'}</span>: <span className="text-foreground">{'"public"'}</span>
                </div>
                <div className="pl-8">{"}"}</div>
                <div className="pl-4">]</div>
                <div>{"}"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
