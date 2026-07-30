import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { KpiTiles } from '@/components/dashboard/kpi-tiles'
import { StatusBarChart, PriorityDonut } from '@/components/dashboard/charts'
import { SlaHealth } from '@/components/dashboard/sla-health'
import { MiniTicketRow } from '@/components/ticket/mini-ticket-row'
import { DashboardActivityRow } from '@/components/activity-feed'
import {
  useAgents,
  useCurrentAgent,
  useDashboardData,
  useRecentActivity,
  useTickets,
} from '@/data'

const RECENT_LIMIT = 8
const MY_OPEN_LIMIT = 6

export default function Dashboard() {
  const tickets = useTickets()
  const data = useDashboardData()
  const agents = useAgents()
  const recent = useRecentActivity(RECENT_LIMIT)
  const currentAgent = useCurrentAgent()

  if (tickets.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg border border-dashed border-border py-16 text-center">
        <h1 className="font-heading text-xl font-semibold">Welcome to Service Desk</h1>
        <p className="text-sm text-muted-foreground">
          Your queue is empty. Log the first incident to get started.
        </p>
        <Button asChild>
          <Link to="/tickets/new">
            <Plus className="size-4" /> Log your first ticket
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good shift, ${currentAgent?.name.split(' ')[0] ?? 'agent'}`}
        description="A live overview of the incident queue, SLA health, and your open work."
      />

      <KpiTiles data={data} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StatusBarChart data={data} />
        </div>
        <PriorityDonut data={data} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SlaHealth data={data} />

        <section className="rounded-lg border border-border bg-card p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold">My open tickets</h2>
            <span className="text-xs text-muted-foreground">{data.myOpen.length}</span>
          </div>
          {data.myOpen.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              You have no open tickets. Nicely done.
            </p>
          ) : (
            <div className="-mx-2 divide-y divide-border/60">
              {data.myOpen.slice(0, MY_OPEN_LIMIT).map((t) => (
                <MiniTicketRow key={t.id} ticket={t} />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-2 font-heading text-base font-semibold">Recent activity</h2>
          <ul className="divide-y divide-border/60">
            {recent.map((a) => (
              <DashboardActivityRow key={a.id} activity={a} agents={agents} />
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
