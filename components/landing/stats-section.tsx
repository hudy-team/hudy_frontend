const stats = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "< 100ms", label: "Avg Response" },
  { value: "REST", label: "JSON API" },
]

export function StatsSection() {
  return (
    <section className="border-y border-border px-6 py-16">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-3xl font-bold text-foreground md:text-4xl">{stat.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
