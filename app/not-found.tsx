import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HuDyLogo } from "@/components/hudy-logo"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          <HuDyLogo size="lg" href="/" />
        </div>

        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <FileQuestion className="h-12 w-12 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              페이지를 찾을 수 없습니다
            </h1>
            <p className="text-muted-foreground">
              요청하신 페이지가 존재하지 않거나 이동되었습니다.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-6xl font-bold text-primary">404</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button asChild variant="default">
              <a href="/">홈으로 돌아가기</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/dashboard">대시보드 바로가기</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
