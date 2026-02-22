import Link from "next/link"
import { HuDyLogo } from "@/components/hudy-logo"

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <HuDyLogo size="sm" href="/" />

        <nav aria-label="푸터 내비게이션" className="flex flex-wrap items-center justify-center gap-6">
          <Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            이용약관
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            개인정보처리방침
          </Link>
        </nav>

        <p className="text-sm text-muted-foreground">
          {"© 2026 HuDy. All rights reserved."}
        </p>
      </div>

      <div className="mx-auto max-w-7xl border-t border-border px-6 pb-6 pt-4">
        <p className="text-center text-xs text-muted-foreground">
          본 서비스는{" "}
          <a
            href="https://www.data.go.kr/data/15012690/openapi.do"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            공공데이터포털
          </a>
          의 한국천문연구원 특일 정보를 활용하여 제공됩니다.
        </p>
      </div>
    </footer>
  )
}
