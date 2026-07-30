// Small shared presentational bits: agent avatar+name, presence dot, unassigned pill.
import { UserRound } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { agentInitials } from '@/lib/domain'
import type { Agent, Presence } from '@/lib/types'

const PRESENCE_TONE: Record<Presence, string> = {
  online: 'bg-[var(--chart-1)]',
  away: 'bg-[var(--chart-3)]',
  offline: 'bg-muted-foreground',
}

export function PresenceDot({ presence, className }: { presence: Presence; className?: string }) {
  return (
    <span
      className={cn('inline-block size-2 rounded-full ring-2 ring-card', PRESENCE_TONE[presence], className)}
      aria-label={presence}
    />
  )
}

export function AgentChip({
  agent,
  size = 'sm',
  showRole = false,
}: {
  agent: Agent | undefined
  size?: 'sm' | 'md'
  showRole?: boolean
}) {
  if (!agent) {
    return (
      <span className="inline-flex items-center gap-2 text-muted-foreground">
        <span className="flex size-6 items-center justify-center rounded-full border border-dashed border-border">
          <UserRound className="size-3" />
        </span>
        <span className="text-sm">Unassigned</span>
      </span>
    )
  }
  const avatarSize = size === 'md' ? 'size-8' : 'size-6'
  return (
    <span className="inline-flex items-center gap-2">
      <Avatar className={avatarSize}>
        <AvatarFallback className="bg-secondary text-[0.65rem] font-semibold text-secondary-foreground">
          {agentInitials(agent.name)}
        </AvatarFallback>
      </Avatar>
      <span className="flex flex-col leading-tight">
        <span className={cn('font-medium text-foreground', size === 'md' ? 'text-sm' : 'text-sm')}>
          {agent.name}
        </span>
        {showRole && (
          <span className="text-xs capitalize text-muted-foreground">{agent.role}</span>
        )}
      </span>
    </span>
  )
}
