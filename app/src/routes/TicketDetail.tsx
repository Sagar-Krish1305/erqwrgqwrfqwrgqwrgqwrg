import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PriorityBadge, StatusBadge } from '@/components/badges'
import { StatusStepper } from '@/components/ticket/status-stepper'
import { SlaPanel } from '@/components/ticket/sla-panel'
import { PropertiesPanel } from '@/components/ticket/properties-panel'
import { Composer } from '@/components/ticket/composer'
import { ActivityItem } from '@/components/activity-feed'
import { CATEGORY_LABELS } from '@/lib/domain'
import { useAgents, useTicket, useTicketActivities } from '@/data'

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>()
  const ticket = useTicket(id)
  const activities = useTicketActivities(id)
  const agents = useAgents()

  if (!ticket) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg border border-dashed border-border py-16 text-center">
        <h1 className="font-heading text-xl font-semibold">Ticket not found</h1>
        <p className="text-sm text-muted-foreground">
          {id ? `${id} does not exist or was removed.` : 'No ticket specified.'}
        </p>
        <Button asChild variant="outline">
          <Link to="/tickets">
            <ArrowLeft className="size-4" /> Back to queue
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Link
          to="/tickets"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to queue
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-sm text-muted-foreground">{ticket.id}</span>
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
          <span className="text-sm text-muted-foreground">{CATEGORY_LABELS[ticket.category]}</span>
        </div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance">
          {ticket.subject}
        </h1>
        <StatusStepper status={ticket.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-2 font-heading text-base font-semibold">Description</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {ticket.description}
            </p>
            {ticket.resolutionNote && (
              <div className="mt-4 rounded-md border border-[color-mix(in_srgb,var(--chart-1),transparent_70%)] bg-[color-mix(in_srgb,var(--chart-1),transparent_92%)] p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--chart-1)]">
                  Resolution
                </p>
                <p className="mt-1 text-sm text-foreground/90">{ticket.resolutionNote}</p>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-base font-semibold">Activity</h2>
            <Composer ticketId={ticket.id} />
            {activities.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
                <MessageSquare className="size-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No activity yet. Add a reply or an internal note to start the thread.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {activities.map((a) => (
                  <ActivityItem key={a.id} activity={a} agents={agents} />
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <SlaPanel ticket={ticket} />
          <PropertiesPanel ticket={ticket} />
        </aside>
      </div>
    </div>
  )
}
