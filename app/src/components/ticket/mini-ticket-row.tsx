// Compact ticket row for dashboard lists — subject, priority, SLA countdown.
import { Link } from 'react-router-dom'
import { PriorityBadge, SlaBadge } from '@/components/badges'
import { computeSlaState, slaCountdown } from '@/lib/domain'
import type { Ticket } from '@/lib/types'

export function MiniTicketRow({ ticket }: { ticket: Ticket }) {
  const sla = computeSlaState(ticket)
  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/60"
    >
      <PriorityBadge priority={ticket.priority} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{ticket.subject}</p>
        <p className="text-xs text-muted-foreground">{ticket.id}</p>
      </div>
      <SlaBadge state={sla} label={slaCountdown(ticket)} />
    </Link>
  )
}
