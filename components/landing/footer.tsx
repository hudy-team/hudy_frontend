import Link from "next/link"
import { HuDyLogo } from "@/components/hudy-logo"

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <HuDyLogo size="sm" href="/" />

        <div className="flex items-center gap-6">
          <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link href="#docs" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            API Docs
          </Link>
          <Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            이용약관
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            개인정보처리방침
          </Link>
        </div>

        <p className="text-sm text-muted-foreground">
          {"2026 HuDy. All rights reserved."}
        </p>
      </div>
    </footer>
  )
}
