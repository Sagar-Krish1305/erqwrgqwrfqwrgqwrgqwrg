// Activity timeline / feed. `reply` and `note` are visually distinct; `system` is muted.
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { CircleDot, Lock, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { agentInitials } from '@/lib/domain'
import type { Activity, Agent } from '@/lib/types'

function authorName(agents: Agent[], id: string): string {
  return agents.find((a) => a.id === id)?.name ?? 'System'
}

export function ActivityItem({
  activity,
  agents,
}: {
  activity: Activity
  agents: Agent[]
}) {
  const when = formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })
  const name = authorName(agents, activity.authorId)

  if (activity.type === 'system') {
    return (
      <li className="flex items-center gap-3 py-2 text-sm text-muted-foreground">
        <CircleDot className="size-3.5 shrink-0" />
        <span>{activity.body}</span>
        <span className="ml-auto shrink-0 text-xs">{when}</span>
      </li>
    )
  }

  const isNote = activity.type === 'note'
  return (
    <li
      className={cn(
        'rounded-lg border p-3',
        isNote
          ? 'border-[color-mix(in_srgb,var(--chart-3),transparent_70%)] bg-[color-mix(in_srgb,var(--chart-3),transparent_92%)]'
          : 'border-border bg-card',
      )}
    >
      <div className="mb-1.5 flex items-center gap-2 text-sm">
        <span className="flex size-6 items-center justify-center rounded-full bg-secondary text-[0.65rem] font-semibold text-secondary-foreground">
          {agentInitials(name)}
        </span>
        <span className="font-medium">{name}</span>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          {isNote ? <Lock className="size-3" /> : <MessageSquare className="size-3" />}
          {isNote ? 'Internal note' : 'Public reply'}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">{when}</span>
      </div>
      <p className="whitespace-pre-wrap text-sm text-foreground/90">{activity.body}</p>
    </li>
  )
}

export function DashboardActivityRow({
  activity,
  agents,
}: {
  activity: Activity & { ticket?: { id: string; subject: string } }
  agents: Agent[]
}) {
  const when = formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })
  const name = authorName(agents, activity.authorId)
  return (
    <li className="flex items-start gap-3 py-2.5 text-sm">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[0.6rem] font-semibold text-secondary-foreground">
        {agentInitials(name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-foreground/90">
          <span className="font-medium">{name}</span> · {activity.body}
        </p>
        {activity.ticket && (
          <Link
            to={`/tickets/${activity.ticket.id}`}
            className="text-xs text-primary hover:underline"
          >
            {activity.ticket.id} · {activity.ticket.subject}
          </Link>
        )}
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">{when}</span>
    </li>
  )
}
