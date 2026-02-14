"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HuDyLogo } from "@/components/hudy-logo"

export default function Error({
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          <HuDyLogo size="lg" href="/" />
        </div>

        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <AlertTriangle className="h-12 w-12 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              오류가 발생했습니다
            </h1>
            <p className="text-muted-foreground">
              죄송합니다. 예상치 못한 문제가 발생했습니다.
            </p>
          </div>

          {error.message && (
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground font-mono break-all">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button onClick={reset} variant="default">
              다시 시도
            </Button>
            <Button asChild variant="outline">
              <a href="/">홈으로 돌아가기</a>
            </Button>
          </div>
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
