import { Calendar, CalendarCheck, Code2, Layers, Package, Zap } from "lucide-react"

const features = [
  {
    icon: Calendar,
    title: "공휴일 조회",
    description: "대한민국 법정 공휴일, 대체 공휴일, 임시 공휴일까지 모두 정확하게 조회할 수 있습니다.",
  },
  {
    icon: Layers,
    title: "커스텀 공휴일",
    description: "회사 창립기념일, 사내 행사일 등 나만의 커스텀 공휴일을 등록하고 API로 조회하세요.",
  },
  {
    icon: CalendarCheck,
    title: "영업일 관리",
    description: "특정 날짜의 영업일 여부 확인, 기간 내 영업일 수 계산, N영업일 후/전 날짜 계산을 지원합니다.",
  },
  {
    icon: Package,
    title: "공식 SDK",
    description: "Node.js와 Python SDK를 제공합니다. npm install 또는 pip install 한 줄이면 바로 시작.",
  },
  {
    icon: Zap,
    title: "빠른 응답 속도",
    description: "어디서나 100ms 이내 응답. 안정적인 인프라로 서비스합니다.",
  },
  {
    icon: Code2,
    title: "개발자 친화적",
    description: "RESTful API, JSON 응답, MCP 지원. 어떤 언어에서든, AI Agent에서도 쉽게 연동할 수 있습니다.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">Features</p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {"개발자를 위해 설계된 API"}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
            {"단순한 공휴일 조회를 넘어, 비즈니스에 필요한 모든 휴일 관련 기능을 제공합니다."}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30 hover:bg-card/80"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
