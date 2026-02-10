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

### Import alias

`@/*` → 프로젝트 루트 (예: `@/components/ui/button`, `@/lib/utils`)

## Styling Conventions

- **다크 테마 전용** — `:root`에 다크 색상만 정의 (light 테마 없음)
- **HSL CSS 변수** — `globals.css`에서 `--primary: 2 68% 52%` 형식으로 정의, Tailwind에서 `hsl(var(--primary))` 사용
- **Primary 색상**: 빨간계열 (HSL 2 68% 52%)
- 새 컴포넌트 추가 시 `npx shadcn@latest add <component>` 사용

## Key Notes

- `next.config.mjs`에 `ignoreBuildErrors: true` 설정됨 — TypeScript 에러가 빌드를 막지 않음
- 현재 **백엔드 미연동** 상태 — 대시보드 데이터는 모두 목업/로컬 state
- 테스트 프레임워크 미설정
- 한국어 UI, 기술 용어는 영문 유지
