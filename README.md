<div align="center">

# Hudy Frontend

**Korean Public Holiday API — Landing & Dashboard**

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-Private-gray)]()

<br/>

대한민국 공휴일 조회, 영업일 계산, 커스텀 공휴일 관리를 위한<br/>
REST API 서비스의 랜딩 페이지 및 대시보드 애플리케이션입니다.

<br/>

[Features](#features) &bull;
[Tech Stack](#tech-stack) &bull;
[Quick Start](#-quick-start) &bull;
[Architecture](#-architecture)

</div>

<br/>

## Features

- **랜딩 페이지** &mdash; 서비스 소개, 기능 안내, 요금제, API 문서, FAQ
- **대시보드** &mdash; API 사용량 통계 및 차트 시각화
- **API 키 관리** &mdash; API 키 발급, 조회, 삭제
- **공휴일 관리** &mdash; 법정 공휴일 조회 + 커스텀 공휴일 CRUD
- **OAuth 인증** &mdash; Google / GitHub 소셜 로그인, Magic Link 지원
- **MCP 서버** &mdash; AI 에이전트 연동을 위한 Model Context Protocol 지원

<br/>

## Tech Stack

| Category | Technology |
|:---------|:-----------|
| Framework | ![Next.js](https://img.shields.io/badge/Next.js_16-App_Router-000000?logo=next.js&logoColor=white) |
| Language | ![TypeScript](https://img.shields.io/badge/TypeScript-5.7_strict-3178C6?logo=typescript&logoColor=white) |
| UI | ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black) ![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Radix-000000?logo=shadcnui&logoColor=white) |
| Styling | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white) ![Motion](https://img.shields.io/badge/Motion-Framer-FF0055?logo=framer&logoColor=white) |
| Auth | ![Supabase](https://img.shields.io/badge/Supabase-Auth-3FCF8E?logo=supabase&logoColor=white) |
| Forms | ![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?logo=reacthookform&logoColor=white) ![Zod](https://img.shields.io/badge/Zod-3E67B1?logo=zod&logoColor=white) |
| Monitoring | ![Sentry](https://img.shields.io/badge/Sentry-362D59?logo=sentry&logoColor=white) ![Vercel Analytics](https://img.shields.io/badge/Vercel-Analytics-000000?logo=vercel&logoColor=white) |
| Payments | ![Paddle](https://img.shields.io/badge/Paddle-FDDB33?logo=paddle&logoColor=black) |

<br/>

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/)

### Setup

```bash
# Clone
git clone https://github.com/hudy-team/hudy_frontend.git
cd hudy_frontend

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

서버가 `http://localhost:3000`에서 시작됩니다.

### Scripts

```bash
pnpm dev          # 개발 서버 (Turbo 모드)
pnpm build        # 프로덕션 빌드
pnpm start        # 프로덕션 서버
pnpm lint         # ESLint
```

<br/>

## 🏗 Architecture

```
app/
├── layout.tsx              # 루트 레이아웃 (Inter, JetBrains Mono)
├── page.tsx                # 랜딩 페이지
├── login/page.tsx          # 로그인 (OAuth, Magic Link)
└── dashboard/
    ├── layout.tsx          # 사이드바 + 모바일 네비게이션
    ├── page.tsx            # API 통계, 사용량 차트
    ├── api-keys/page.tsx   # API 키 CRUD
    └── holidays/page.tsx   # 공휴일 조회 + 커스텀 공휴일

components/
├── ui/                     # shadcn/ui 컴포넌트 (50+)
├── landing/                # 랜딩 페이지 섹션
├── dashboard/              # 대시보드 레이아웃
└── hudy-logo.tsx

lib/                        # 유틸리티 (cn, API 헬퍼)
hooks/                      # 커스텀 훅 (use-mobile, use-toast)
```

<br/>

## License

This project is private and proprietary.
