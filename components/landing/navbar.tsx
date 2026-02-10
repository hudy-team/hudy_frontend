"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { HuDyLogo } from "@/components/hudy-logo"
import { Menu, X } from "lucide-react"
import Link from "next/link"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <HuDyLogo size="md" />

        <div className="hidden items-center gap-8 md:flex">
          <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link href="#docs" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            API Docs
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/login">Get Started</Link>
          </Button>
        </div>

        <button
          type="button"
          className="text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-border/50 bg-background px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link href="#features" className="text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>
              Pricing
            </Link>
            <Link href="#docs" className="text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>
              API Docs
            </Link>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/login">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
