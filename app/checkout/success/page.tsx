import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function CheckoutSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">구독이 완료되었습니다!</h1>
        <p className="mb-8 text-muted-foreground">
          HuDy Pro 플랜이 활성화되었습니다. 대시보드에서 API 키를 발급받으세요.
        </p>
        <Button asChild>
          <Link href="/dashboard">대시보드로 이동</Link>
        </Button>
      </div>
    </div>
  )
}
