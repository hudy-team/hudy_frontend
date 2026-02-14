"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <AlertTriangle className="h-10 w-10 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            오류가 발생했습니다
          </h2>
          <p className="text-muted-foreground">
            요청을 처리하는 중 문제가 발생했습니다.
          </p>
        </div>

        {error.message && (
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground font-mono break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button onClick={reset} variant="default">
            다시 시도
          </Button>
          <Button asChild variant="outline">
            <a href="/dashboard">대시보드로 돌아가기</a>
          </Button>
        </div>

        {error.digest && (
          <p className="text-xs text-muted-foreground">
            오류 ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
