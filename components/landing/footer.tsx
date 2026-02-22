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
    </footer>
  )
}
