const stats = [
  { value: "99.99%", label: "Uptime SLA" },
  { value: "< 50ms", label: "Avg Response" },
  { value: "12M+", label: "API Calls / Month" },
  { value: "3,200+", label: "Active Developers" },
]

export function StatsSection() {
  return (
    <section className="border-y border-border px-6 py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 md:grid-cols-4">
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
