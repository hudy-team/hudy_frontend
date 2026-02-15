const stats = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "< 100ms", label: "Avg Response" },
  { value: "REST", label: "JSON API" },
]

export function StatsSection() {
  return (
    <section className="border-y border-border px-6 py-16">
      <div className="mx-auto grid max-w-5xl grid-cols-3 gap-4 sm:gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-xl font-bold text-foreground sm:text-3xl md:text-4xl">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
