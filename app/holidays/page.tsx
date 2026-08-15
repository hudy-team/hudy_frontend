import { redirect } from "next/navigation"
import { kstDateString } from "@/lib/date"

export default function HolidaysIndexPage() {
  const kstYear = kstDateString().slice(0, 4)
  redirect(`/holidays/${kstYear}`)
}
