// SLA health summary — a stacked proportion bar over open tickets.
import type { DashboardData } from '@/data'

export function SlaHealth({ data }: { data: DashboardData }) {
  const total = data.slaOnTrack + data.slaWarning + data.slaBreached
  const segments = [
    { key: 'on', label: 'On track', value: data.slaOnTrack, color: 'var(--chart-1)' },
    { key: 'warn', label: 'Due soon', value: data.slaWarning, color: 'var(--chart-3)' },
    { key: 'breach', label: 'Breached', value: data.slaBreached, color: 'var(--destructive)' },
  ]
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="mb-4 font-heading text-base font-semibold">SLA health</h2>
      {total === 0 ? (
        <p className="text-sm text-muted-foreground">No open tickets to track.</p>
      ) : (
        <>
          <div className="flex h-3 overflow-hidden rounded-full bg-muted">
            {segments.map((s) =>
              s.value > 0 ? (
                <div
                  key={s.key}
                  style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }}
                  aria-label={`${s.label}: ${s.value}`}
                />
              ) : null,
            )}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {segments.map((s) => (
              <div key={s.key} className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.label}
                </div>
                <div className="font-heading text-xl font-semibold tabular-nums">{s.value}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
