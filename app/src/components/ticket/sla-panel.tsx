// SLA panel: response + resolution due with a color-coded resolution countdown bar.
import { format } from 'date-fns'
import { Progress } from '@/components/ui/progress'
import { SlaBadge } from '@/components/badges'
import { HOUR_MS, SLA_HOURS, computeSlaState, isTerminal, slaCountdown } from '@/lib/domain'
import type { Ticket } from '@/lib/types'

export function SlaPanel({ ticket }: { ticket: Ticket }) {
  const now = Date.now()
  const state = computeSlaState(ticket, now)
  const created = new Date(ticket.createdAt).getTime()
  const due = new Date(ticket.resolutionDueAt).getTime()
  const total = SLA_HOURS[ticket.priority] * HOUR_MS
  const elapsed = Math.min(Math.max(now - created, 0), total)
  const pct = isTerminal(ticket.status) ? 100 : Math.round((elapsed / total) * 100)

  const barColor =
    state === 'breached'
      ? 'var(--destructive)'
      : state === 'warning'
        ? 'var(--chart-3)'
        : 'var(--chart-1)'

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base font-semibold">SLA</h2>
        <SlaBadge state={state} label={slaCountdown(ticket, now)} />
      </div>
      <Progress value={pct} indicatorColor={barColor} />
      <div className="grid grid-cols-2 gap-3 pt-1 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Response due</p>
          <p className="font-medium">{format(new Date(ticket.responseDueAt), 'MMM d, HH:mm')}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Resolution due</p>
          <p className="font-medium">{format(new Date(due), 'MMM d, HH:mm')}</p>
        </div>
      </div>
    </div>
  )
}
