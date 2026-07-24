# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HuDy(휴디) - 대한민국 공휴일 API 서비스의 프론트엔드. 랜딩 페이지 + 대시보드(API 키 관리, 공휴일 관리)로 구성된 Next.js 앱.

## Commands

```bash
pnpm dev          # 개발 서버 (Turbo 모드)
pnpm build        # 프로덕션 빌드
pnpm start        # 프로덕션 서버
pnpm lint         # ESLint
```

패키지 매니저는 **pnpm**만 사용. npm/yarn 사용 금지.

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5.7** (strict)
- **Tailwind CSS 3** + **shadcn/ui** (Radix UI primitives)
- **Icons**: lucide-react
- **Forms**: react-hook-form + zod
- **Charts**: recharts
- **Dates**: date-fns + react-day-picker
- **Toasts**: sonner

## Architecture

### 라우팅

```
app/
├── layout.tsx              # 루트 레이아웃 (Inter, JetBrains Mono 폰트, lang="ko")
├── page.tsx                # 랜딩 페이지
├── globals.css             # CSS 변수 기반 다크 테마 (HSL)
├── login/page.tsx          # 로그인 (Google/GitHub OAuth, magic link)
└── dashboard/
    ├── layout.tsx           # 사이드바 + 모바일 네비게이션 래퍼
    ├── page.tsx             # API 통계, 사용량 차트
    ├── api-keys/page.tsx    # API 키 CRUD
    └── holidays/page.tsx    # 공휴일 조회 + 커스텀 공휴일 CRUD
```

### 컴포넌트 구조

```
components/
├── ui/           # shadcn/ui 컴포넌트 (50+개, 직접 수정 가능)
├── landing/      # 랜딩 페이지 섹션 컴포넌트
├── dashboard/    # 대시보드 레이아웃 컴포넌트 (sidebar, mobile-nav)
├── hudy-logo.tsx
└── theme-provider.tsx
```

### 유틸리티 및 훅

- `lib/utils.ts` — `cn()` (clsx + tailwind-merge)
- `hooks/use-mobile.tsx` — 모바일 감지
- `hooks/use-toast.ts` — 토스트 알림
- `lib/supabase/client.ts` — 브라우저 Supabase 클라이언트 (anon 키)
- `lib/date.ts` — KST 기준 날짜 헬퍼 (`kstDateString`, `kstMonthPrefix`, `kstDaysAgoString`)
- `lib/plan.ts` — 플랜별 월 쿼터 및 대시보드 표시 상수

### 데이터베이스

Supabase PostgreSQL. 스키마 원본은 코어 API 서버 repo(`hudy_backend/migrations/`)에 있고,
프론트에서 적용한 보안/RLS 관련 마이그레이션만 `supabase/migrations/` 에 기록한다.

전 테이블 RLS 활성. 정책은 `(select auth.uid()) = user_id` 형태이며 `authenticated` 역할에 한정된다.

### Import alias

`@/*` → 프로젝트 루트 (예: `@/components/ui/button`, `@/lib/utils`)

## Styling Conventions

- **다크 테마 전용** — `:root`에 다크 색상만 정의 (light 테마 없음)
- **HSL CSS 변수** — `globals.css`에서 `--primary: 2 68% 52%` 형식으로 정의, Tailwind에서 `hsl(var(--primary))` 사용
- **Primary 색상**: 빨간계열 (HSL 2 68% 52%)
- 새 컴포넌트 추가 시 `npx shadcn@latest add <component>` 사용

## Key Notes

- `next.config.mjs`에 `ignoreBuildErrors: true` 설정됨 — TypeScript 에러가 빌드를 막지 않음
- **Supabase 연동 완료** — 대시보드는 `api_keys` / `api_usage_daily` / `subscriptions` 를 직접 조회한다 (목업 아님)
- **API 키 발급은 서버측 RPC 전용** — `issue_api_key(key_name)` / `rotate_api_key(p_key_id)`.
  `api_keys` 테이블에 대한 클라이언트 INSERT 권한은 없고 UPDATE 는 `name`/`is_active` 컬럼만 허용된다
- **타임존은 KST(UTC+9) 고정** — 날짜 계산에는 `lib/date.ts` 의 헬퍼를 쓴다. `new Date().getMonth()` 같은
  로컬 타임존 의존 코드를 쓰지 말 것
- **플랜 쿼터는 `lib/plan.ts`** — 백엔드 `hudy_backend/src/middleware/api_key_auth.rs` 상수와 동기화 필요
- 테스트 프레임워크 미설정
- 한국어 UI, 기술 용어는 영문 유지
