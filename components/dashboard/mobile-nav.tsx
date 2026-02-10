"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Calendar, Key, LayoutDashboard, LogOut, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { HuDyLogo } from "@/components/hudy-logo"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
  { href: "/dashboard/holidays", label: "Custom Holidays", icon: Calendar },
]

export function DashboardMobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="lg:hidden">
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <HuDyLogo size="sm" />
        <button type="button" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5 text-foreground" /> : <Menu className="h-5 w-5 text-foreground" />}
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="fixed right-0 top-[53px] bottom-0 w-64 border-l border-border bg-card p-4" onClick={(e) => e.stopPropagation()}>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="mt-4 border-t border-border pt-4">
              <Link
                href="/login"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                {"로그아웃"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
