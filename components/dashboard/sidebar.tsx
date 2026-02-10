"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Key, LayoutDashboard, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { HuDyLogo } from "@/components/hudy-logo"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
  { href: "/dashboard/holidays", label: "Custom Holidays", icon: Calendar },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-card max-lg:hidden">
      <div className="flex items-center gap-2 border-b border-border px-6 py-5">
        <HuDyLogo size="md" />
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
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

      <div className="border-t border-border p-4">
        <div className="mb-3 flex items-center gap-3 px-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-medium text-foreground">
            J
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-foreground">John Doe</p>
            <p className="truncate text-xs text-muted-foreground">john@example.com</p>
          </div>
        </div>
        <Link
          href="/login"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          {"로그아웃"}
        </Link>
      </div>
    </aside>
  )
}
