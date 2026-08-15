import { notFound } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { HolidayList } from "@/components/holidays/holiday-list"
import { BusinessDayCalculator } from "@/components/holidays/business-day-calculator"
import { getAvailableYears, getHolidaysByYear } from "@/lib/holidays"
import { kstDateString } from "@/lib/date"

export const revalidate = 3600

interface PageProps {
  params: Promise<{ year: string }>
}

export async function generateStaticParams() {
  const years = await getAvailableYears()
  return years.map((year) => ({ year: String(year) }))
}

function dateToUtcMs(date: string): number {
  const [y, m, d] = date.split("-").map(Number)
  return Date.UTC(y, m - 1, d)
}

export default async function HolidayYearPage({ params }: PageProps) {
  const { year: yearParam } = await params
  const year = Number(yearParam)

  if (!Number.isInteger(year) || String(year) !== yearParam) {
    notFound()
  }

  const availableYears = await getAvailableYears()
  if (!availableYears.includes(year)) {
    notFound()
  }

  const holidays = await getHolidaysByYear(year)
  const nextYearHolidays = availableYears.includes(year + 1)
    ? await getHolidaysByYear(year + 1)
    : []
  const calculatorHolidays = [...holidays, ...nextYearHolidays].map((h) => h.date)
  const todayKst = kstDateString()

  const substituteCount = holidays.filter((h) => h.isSubstitute).length

  const upcoming = holidays.find((h) => h.date >= todayKst)
  let nextHolidayText = "올해 공휴일 종료"
  if (upcoming) {
    if (upcoming.date === todayKst) {
      nextHolidayText = `오늘 · ${upcoming.name}`
    } else {
      const dDay = Math.round((dateToUtcMs(upcoming.date) - dateToUtcMs(todayKst)) / (24 * 60 * 60 * 1000))
      nextHolidayText = `${upcoming.name} · D-${dDay}`
    }
  }

  return (
    <>
      <main>
        <Navbar />

        <div className="mx-auto max-w-4xl px-6 pb-16 pt-28 md:pt-32">
          <nav aria-label="breadcrumb" className="font-mono text-sm text-muted-foreground">
            hudy.co.kr / holidays / {year}
          </nav>

          <h1 className="mt-4 text-3xl font-bold text-foreground md:text-4xl">
            <span className="text-primary">{year}</span>년 대한민국 공휴일
          </h1>

          <p className="mt-4 text-muted-foreground leading-relaxed">
            법정공휴일과 대체공휴일 전체 목록입니다. 임시공휴일이 지정되면 즉시 반영되며, 같은
            데이터를 REST API·iCal 구독으로 받아볼 수 있습니다.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {availableYears.map((y) => {
              const isCurrent = y === year
              return (
                <Link
                  key={y}
                  href={`/holidays/${y}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    isCurrent
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {y}
                </Link>
              )
            })}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-sm text-muted-foreground">연간 공휴일</div>
              <div className="mt-2 text-2xl font-bold text-foreground">{holidays.length}일</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-sm text-muted-foreground">대체공휴일</div>
              <div className="mt-2 text-2xl font-bold text-foreground">{substituteCount}일</div>
            </div>
            <div className="rounded-xl border border-primary/40 bg-primary/5 p-5">
              <div className="text-sm text-primary">다음 공휴일</div>
              <div className="mt-2 text-2xl font-bold text-foreground">{nextHolidayText}</div>
            </div>
          </div>

          <div className="mt-12">
            <HolidayList holidays={holidays} todayKst={todayKst} />
          </div>

          <div className="mt-16">
            <BusinessDayCalculator holidays={calculatorHolidays} initialDate={todayKst} />
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-8 md:grid-cols-2">
            <div className="flex flex-col justify-center gap-4">
              <h2 className="text-2xl font-bold text-foreground">이 데이터를 서비스에 넣으세요</h2>
              <p className="text-muted-foreground leading-relaxed">
                급여 정산, 배송 예정일, 알림 스케줄링 — 공휴일 하드코딩 대신 API 한 줄이면
                됩니다. 임시공휴일 지정도 배포 없이 자동 반영됩니다.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/login">무료로 시작하기</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/#docs">API 문서 보기</Link>
                </Button>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-background/60 p-5 font-mono text-sm text-muted-foreground overflow-x-auto">
              <pre>{`# ${year}년 공휴일 전체 조회
curl "https://api.hudy.co.kr/v2/holidays?year=${year}" \\
  -H "x-api-key: hd_live_..."`}</pre>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </>
  )
}
