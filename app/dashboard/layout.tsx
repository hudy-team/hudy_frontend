import React from "react"
import type { Metadata } from 'next'
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardMobileNav } from "@/components/dashboard/mobile-nav"

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <DashboardSidebar />
      <DashboardMobileNav />
      <main className="lg:ml-64">
        <div className="px-6 py-8 pt-20 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}
