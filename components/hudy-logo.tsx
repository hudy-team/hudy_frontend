import Image from "next/image"
import Link from "next/link"

interface HuDyLogoProps {
  size?: "sm" | "md" | "lg"
  href?: string
  showText?: boolean
}

const sizes = {
  sm: { icon: 28, text: "text-lg" },
  md: { icon: 32, text: "text-xl" },
  lg: { icon: 40, text: "text-2xl" },
}

export function HuDyLogo({ size = "md", href = "/", showText = true }: HuDyLogoProps) {
  const s = sizes[size]

  const content = (
    <span className="flex items-center gap-2">
      <Image
        src="/hudy-icon.webp"
        alt="HuDy logo"
        width={s.icon}
        height={s.icon}
        className="rounded-lg"
      />
      {showText && (
        <span className={`font-bold tracking-tight text-foreground ${s.text}`}>HuDy</span>
      )}
    </span>
  )

  if (href) {
    return <Link href={href} className="flex items-center gap-2">{content}</Link>
  }

  return content
}
