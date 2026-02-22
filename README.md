# HuDy (휴디) - 대한민국 공휴일 API 프론트엔드

대한민국 공휴일 조회, 영업일 계산, 커스텀 공휴일 관리를 위한 REST API 서비스의 프론트엔드 애플리케이션입니다.

> https://www.hudy.co.kr

## 주요 기능

- **공휴일 조회** - 대한민국 법정 공휴일 및 커스텀 공휴일 조회
- **영업일 계산** - 주말/공휴일을 제외한 영업일 수 계산, N 영업일 후 날짜 산출
- **커스텀 공휴일 관리** - 회사 창립기념일 등 사용자 정의 공휴일 등록/수정/삭제
- **API 키 관리** - 대시보드에서 API 키 발급 및 사용량 모니터링
- **MCP 서버 지원** - AI 에이전트 연동을 위한 MCP(Model Context Protocol) 서버 제공

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.7 (strict) |
| UI Library | React 19 |
| Styling | Tailwind CSS 3 + shadcn/ui (Radix UI) |
| Icons | lucide-react |
| Forms | react-hook-form + zod |
| Charts | recharts |
| Dates | date-fns + react-day-picker |
| Animation | motion (Framer Motion) |
| Auth | Supabase (Google/GitHub OAuth, magic link) |
| Monitoring | Sentry, Vercel Analytics |
| Payments | Paddle |

## 시작하기

### 요구 사항

- Node.js 18+
- pnpm

### 설치

```bash
pnpm install
```

### 개발 서버

```bash
pnpm dev
```

http://localhost:3000 에서 확인할 수 있습니다.

### 빌드

```bash
pnpm build
pnpm start
```

### 린트

```bash
pnpm lint
```

## 프로젝트 구조

```
app/
├── layout.tsx              # 루트 레이아웃
├── page.tsx                # 랜딩 페이지
├── login/page.tsx          # 로그인
└── dashboard/
    ├── layout.tsx          # 대시보드 레이아웃
    ├── page.tsx            # API 통계 및 사용량
    ├── api-keys/page.tsx   # API 키 관리
    └── holidays/page.tsx   # 공휴일 관리

components/
├── ui/                     # shadcn/ui 컴포넌트
├── landing/                # 랜딩 페이지 섹션
├── dashboard/              # 대시보드 레이아웃
└── hudy-logo.tsx

lib/                        # 유틸리티
hooks/                      # 커스텀 훅
```

## 라이선스

All rights reserved.
