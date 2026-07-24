# FE-1 — 대시보드 페이지 수정 (차트 오버플로우 / 기간 / 스케일 / KST 월집계 / 쿼터 상수)

담당 파일 (이 3개 외에는 **어떤 파일도 수정 금지**):

- 신규 `lib/date.ts`
- 신규 `lib/plan.ts`
- 수정 `app/dashboard/page.tsx`

## 배경 (왜 고치는가)

프로덕션 대시보드에서 "일별 API 사용량" 차트가 카드 밖으로 넘쳤다. 실 DB 확인 결과
`api_usage_daily` 에 2026-02-14 ~ 2026-07-24 범위의 **distinct 날짜가 118개** 있는데,
현재 코드는 기간 필터 없이 전부 가져와 118개 막대를 `flex` 한 줄에 그린다.
각 막대 아래 "02-14" 라벨의 최소 폭 때문에 flex 아이템이 축소되지 못해 카드 경계를 뚫는다.

추가로 2월 15일의 대량 호출이 `maxCalls` 기준이 되어 최근 7월 데이터(1~2콜)가 전부
최소 높이 8px 바닥에 깔려 차트가 정보를 전달하지 못한다.

## 1. 신규 파일 `lib/date.ts`

아래 내용으로 **새로 생성**한다.

```ts
const KST_OFFSET_MS = 9 * 60 * 60 * 1000

/** KST(UTC+9) 기준 날짜를 YYYY-MM-DD 로 반환한다. */
export function kstDateString(date: Date = new Date()): string {
  return new Date(date.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10)
}

/** KST 기준 연-월을 YYYY-MM 으로 반환한다. */
export function kstMonthPrefix(date: Date = new Date()): string {
  return kstDateString(date).slice(0, 7)
}

/** KST 기준으로 N일 전 날짜를 YYYY-MM-DD 로 반환한다. */
export function kstDaysAgoString(days: number): string {
  return kstDateString(new Date(Date.now() - days * 24 * 60 * 60 * 1000))
}
```

> 구현 노트: `toISOString()` 은 UTC 기준으로 문자열화하므로, 시각에 +9시간을 더한 뒤
> UTC로 읽으면 KST 로컬 날짜와 같아진다. 이 트릭 외의 방식(`toLocaleDateString` 등)을 쓰지 말 것 —
> 서버/클라이언트 로케일에 따라 결과가 달라진다.

## 2. 신규 파일 `lib/plan.ts`

아래 내용으로 **새로 생성**한다. 값은 백엔드 `hudy_backend/src/middleware/api_key_auth.rs:12-13`
(`FREE_MONTHLY_QUOTA: i64 = 100`, `PRO_MONTHLY_QUOTA: i64 = 5000`)와 일치해야 한다.

```ts
/** 월 API 호출 쿼터. 백엔드 api_key_auth.rs 의 상수와 반드시 일치시킬 것. */
export const FREE_MONTHLY_QUOTA = 100
export const PRO_MONTHLY_QUOTA = 5000

/** 대시보드 차트에 표시할 기간(일). */
export const USAGE_CHART_DAYS = 30

/** Usage Summary 테이블에 표시할 최근 행 수. */
export const USAGE_TABLE_ROWS = 10
```

## 3. 수정 `app/dashboard/page.tsx`

### 3-1. import 추가

파일 상단 import 블록의 마지막(`import { useMemo } from "react"` 아래)에 아래 두 줄을 추가한다.

```ts
import { kstDaysAgoString, kstMonthPrefix } from "@/lib/date"
import {
  FREE_MONTHLY_QUOTA,
  PRO_MONTHLY_QUOTA,
  USAGE_CHART_DAYS,
  USAGE_TABLE_ROWS,
} from "@/lib/plan"
```

### 3-2. 쿼터 상수화

**Before** (36행 부근):

```ts
  const monthlyQuota = hasPro ? 5000 : 100
```

**After**:

```ts
  const monthlyQuota = hasPro ? PRO_MONTHLY_QUOTA : FREE_MONTHLY_QUOTA
```

### 3-3. 사용량 쿼리에 기간 필터 추가 (핵심 수정)

**Before** (54-64행 부근):

```ts
      // Get daily API usage data for user's keys
      const { data: usage, error: usageError } = await supabase
        .from("api_usage_daily")
        .select("*, api_keys!inner(user_id)")
        .order("date", { ascending: true })
```

**After**:

```ts
      // Get daily API usage data for user's keys (최근 USAGE_CHART_DAYS 일)
      const { data: usage, error: usageError } = await supabase
        .from("api_usage_daily")
        .select("*, api_keys!inner(user_id)")
        .gte("date", kstDaysAgoString(USAGE_CHART_DAYS - 1))
        .order("date", { ascending: true })
```

> `USAGE_CHART_DAYS - 1` 인 이유: 오늘을 포함해 30일이 되도록 하기 위함이다.

### 3-4. 월 사용량을 KST 기준으로

**Before** (87-93행 부근):

```ts
  const monthlyUsage = useMemo(() => {
    const now = new Date()
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    return usageData
      .filter((u) => u.date.startsWith(yearMonth))
      .reduce((sum, u) => sum + u.call_count, 0)
  }, [usageData])
```

**After**:

```ts
  const monthlyUsage = useMemo(() => {
    const yearMonth = kstMonthPrefix()
    return usageData
      .filter((u) => u.date.startsWith(yearMonth))
      .reduce((sum, u) => sum + u.call_count, 0)
  }, [usageData])
```

> 주의: 이제 `usageData` 가 최근 30일치만 담으므로 월초에는 이번 달 전체가 커버된다.
> 30일 필터는 항상 이번 달 1일 이후를 포함하므로 월 합계는 정확하다.

### 3-5. 사용하지 않는 `totalCalls` 제거

**Before** (83-85행 부근):

```ts
  // Compute stats from real data
  const totalCalls = useMemo(() => {
    return usageData.reduce((sum, u) => sum + u.call_count, 0)
  }, [usageData])

```

**After**: 이 블록을 **통째로 삭제**한다 (어디에서도 참조하지 않는 죽은 코드다).

### 3-6. 차트 데이터: 데이터 없는 날도 0으로 채우기

**Before** (99-108행 부근):

```ts
  // 일별 총 사용량 (데이터가 있는 날짜만)
  const chartData = useMemo(() => {
    const dateMap = new Map<string, number>()
    for (const u of usageData) {
      dateMap.set(u.date, (dateMap.get(u.date) || 0) + u.call_count)
    }
    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, calls]) => ({ date, calls }))
  }, [usageData])
```

**After**:

```ts
  // 일별 총 사용량 (최근 USAGE_CHART_DAYS 일, 데이터 없는 날은 0)
  const chartData = useMemo(() => {
    const dateMap = new Map<string, number>()
    for (const u of usageData) {
      dateMap.set(u.date, (dateMap.get(u.date) || 0) + u.call_count)
    }
    return Array.from({ length: USAGE_CHART_DAYS }, (_, i) => {
      const date = kstDaysAgoString(USAGE_CHART_DAYS - 1 - i)
      return { date, calls: dateMap.get(date) || 0 }
    })
  }, [usageData])
```

### 3-7. 차트 렌더링: 가로 스크롤 + 최소 막대 폭 (오버플로우 수정)

**Before** (191-214행 부근, `{chartData.length === 0 ? (` 부터 `)}` 까지 전체):

```tsx
            {chartData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                아직 사용량 데이터가 없습니다.
              </p>
            ) : (
              <div className="flex items-end gap-2" style={{ height: 180 }}>
                {chartData.map((d) => (
                  <div key={d.date} className="group flex flex-1 flex-col items-center gap-2 max-w-[60px]">
                    <span className="text-[10px] tabular-nums text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatNumber(d.calls)}
                    </span>
                    <div
                      className="w-full rounded-t-md bg-primary/70 group-hover:bg-primary transition-all"
                      style={{
                        height: `${Math.max((d.calls / maxCalls) * 140, 8)}px`,
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {d.date.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            )}
```

**After**:

```tsx
            {totalChartCalls === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                최근 {USAGE_CHART_DAYS}일간 사용량 데이터가 없습니다.
              </p>
            ) : (
              <div className="-mx-2 overflow-x-auto px-2 pb-1">
                <div className="flex items-end gap-1.5" style={{ height: 180 }}>
                  {chartData.map((d) => (
                    <div
                      key={d.date}
                      className="group flex w-7 shrink-0 flex-col items-center gap-2"
                      title={`${d.date} · ${formatNumber(d.calls)}회`}
                    >
                      <span className="text-[10px] tabular-nums text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                        {formatNumber(d.calls)}
                      </span>
                      <div
                        className="w-full rounded-t-md bg-primary/70 transition-all group-hover:bg-primary"
                        style={{
                          height: `${d.calls === 0 ? 2 : Math.max((d.calls / maxCalls) * 140, 6)}px`,
                        }}
                      />
                      <span className="whitespace-nowrap text-[9px] text-muted-foreground">
                        {d.date.slice(5)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
```

핵심 3가지 (임의로 바꾸지 말 것):

1. 바깥 `overflow-x-auto` 래퍼 — 30개 막대가 화면보다 넓어도 **카드 안에서** 가로 스크롤된다.
2. `flex-1 max-w-[60px]` → `w-7 shrink-0` — 축소 불가 고정 폭이라 라벨이 겹치지 않는다.
3. 0인 날은 2px 로 그려 "데이터 없음"과 "1회 호출"이 시각적으로 구분된다.

### 3-8. 차트 빈 상태 판정용 값 추가

3-7에서 `totalChartCalls` 를 사용하므로, `maxCalls` useMemo **바로 아래**에 추가한다.

**Before** (110-113행 부근):

```ts
  const maxCalls = useMemo(() => {
    const max = Math.max(...chartData.map((d) => d.calls), 0)
    return max > 0 ? max : 1
  }, [chartData])
```

**After**:

```ts
  const maxCalls = useMemo(() => {
    const max = Math.max(...chartData.map((d) => d.calls), 0)
    return max > 0 ? max : 1
  }, [chartData])

  const totalChartCalls = useMemo(
    () => chartData.reduce((sum, d) => sum + d.calls, 0),
    [chartData]
  )
```

### 3-9. 차트 카드 제목에 기간 명시

**Before** (188행 부근):

```tsx
            <CardTitle className="text-base">일별 API 사용량</CardTitle>
```

**After**:

```tsx
            <CardTitle className="text-base">
              일별 API 사용량{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (최근 {USAGE_CHART_DAYS}일)
              </span>
            </CardTitle>
```

### 3-10. Usage Summary 테이블 정리

**Before** (241행 부근):

```tsx
                  {usageData.slice(-10).reverse().map((usage, i) => {
                    const apiKey = apiKeys.find((k) => k.id === usage.api_key_id)
                    return (
                      <tr key={i} className="border-b border-border last:border-0">
```

**After**:

```tsx
                  {usageData.slice(-USAGE_TABLE_ROWS).reverse().map((usage) => {
                    const apiKey = apiKeys.find((k) => k.id === usage.api_key_id)
                    return (
                      <tr key={usage.id} className="border-b border-border last:border-0">
```

> 배열 인덱스 대신 `usage.id`(테이블 PK)를 key로 쓴다. `ApiUsageDaily` 타입에 이미 `id: number` 가 선언돼 있다.

또한 테이블 카드의 제목에 범위를 명시한다.

**Before** (221행 부근):

```tsx
          <CardTitle className="text-base">API Usage Summary</CardTitle>
```

**After**:

```tsx
          <CardTitle className="text-base">
            API Usage Summary{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (최근 {USAGE_TABLE_ROWS}건)
            </span>
          </CardTitle>
```

## 금지 사항

- `app/dashboard/api-keys/page.tsx` 를 건드리지 말 것 (FE-2 담당, 충돌 발생).
- `CLAUDE.md` 를 건드리지 말 것 (FE-3 담당).
- recharts 를 도입하지 말 것. 현재 CSS 막대 차트를 유지한다 (의존성 추가 금지).
- 기간 선택 UI(7일/30일/90일 토글)를 추가하지 말 것 — 범위 밖(원장 D3).
- `components/ui/**` 의 shadcn 컴포넌트를 수정하지 말 것.

## 수용 기준 (반드시 실행해서 통과 확인)

```bash
cd /Users/minkyu/Documents/hudy/hudy_frontend

# 1. 빌드 통과
pnpm build

# 2. 기간 필터가 실제로 들어갔는지
grep -n 'gte("date"' app/dashboard/page.tsx        # 1건 나와야 함

# 3. 오버플로우 래퍼가 들어갔는지
grep -n 'overflow-x-auto' app/dashboard/page.tsx   # 1건 나와야 함

# 4. 하드코딩된 쿼터가 사라졌는지
grep -n 'hasPro ? 5000 : 100' app/dashboard/page.tsx   # 0건이어야 함 (출력 없음)

# 5. 죽은 코드가 사라졌는지
grep -n 'totalCalls' app/dashboard/page.tsx        # totalChartCalls 만 나와야 함

# 6. 신규 파일 존재
ls lib/date.ts lib/plan.ts
```

`pnpm build` 는 `next.config.mjs` 에 `ignoreBuildErrors: true` 가 설정돼 있어 TS 에러를 삼킨다.
따라서 타입 검사를 **반드시 별도로** 돌린다:

```bash
npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E 'app/dashboard/page|lib/date|lib/plan' || echo "TYPE OK (해당 파일 에러 없음)"
```

기존 코드베이스에 이미 존재하던 타입 에러는 무시한다. 위 grep이 **이번에 만진 3개 파일에 대해**
아무것도 출력하지 않으면 통과다.

## 커밋

```bash
git add lib/date.ts lib/plan.ts app/dashboard/page.tsx
git commit -m "fix: 대시보드 차트 최근 30일 제한 및 가로 스크롤 처리, 월 사용량 KST 기준 집계"
```

커밋 후 `WORKPLAN.md` 의 FE-1 체크박스를 `[x]` 로 바꾸고 진행 로그에 한 줄 추가한 뒤 함께 커밋한다.
