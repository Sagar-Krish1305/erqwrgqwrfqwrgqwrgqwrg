// Domain badges: status, priority, SLA. Colors map to the semantic plan via chart
// tokens; each uses a tinted fill + readable foreground (never gray-on-color).
import { cn } from '@/lib/utils'
import type { SlaState, TicketPriority, TicketStatus } from '@/lib/types'
import {
  PRIORITY_SHORT,
  SLA_LABELS,
  STATUS_LABELS,
} from '@/lib/domain'

type Tone = {
  dot: string
  chip: string
}

const STATUS_TONE: Record<TicketStatus, Tone> = {
  new: { dot: 'bg-[var(--chart-2)]', chip: 'bg-[color-mix(in_srgb,var(--chart-2),transparent_86%)] text-[var(--chart-2)]' },
  open: { dot: 'bg-[var(--chart-2)]', chip: 'bg-[color-mix(in_srgb,var(--chart-2),transparent_86%)] text-[var(--chart-2)]' },
  in_progress: { dot: 'bg-[var(--chart-3)]', chip: 'bg-[color-mix(in_srgb,var(--chart-3),transparent_84%)] text-[var(--chart-3)]' },
  on_hold: { dot: 'bg-muted-foreground', chip: 'bg-muted text-muted-foreground' },
  resolved: { dot: 'bg-[var(--chart-1)]', chip: 'bg-[color-mix(in_srgb,var(--chart-1),transparent_86%)] text-[var(--chart-1)]' },
  closed: { dot: 'bg-muted-foreground', chip: 'bg-secondary text-secondary-foreground' },
}

const PRIORITY_TONE: Record<TicketPriority, string> = {
  p1: 'bg-[color-mix(in_srgb,var(--destructive),transparent_82%)] text-[var(--destructive)]',
  p2: 'bg-[color-mix(in_srgb,var(--chart-3),transparent_82%)] text-[var(--chart-3)]',
  p3: 'bg-[color-mix(in_srgb,var(--chart-2),transparent_84%)] text-[var(--chart-2)]',
  p4: 'bg-muted text-muted-foreground',
}

const SLA_TONE: Record<SlaState, string> = {
  on_track: 'bg-[color-mix(in_srgb,var(--chart-1),transparent_86%)] text-[var(--chart-1)]',
  warning: 'bg-[color-mix(in_srgb,var(--chart-3),transparent_82%)] text-[var(--chart-3)]',
  breached: 'bg-[color-mix(in_srgb,var(--destructive),transparent_82%)] text-[var(--destructive)]',
  met: 'bg-muted text-muted-foreground',
}

const PILL = 'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap'

export function StatusBadge({ status, className }: { status: TicketStatus; className?: string }) {
  const tone = STATUS_TONE[status]
  return (
    <span className={cn(PILL, tone.chip, className)}>
      <span className={cn('size-1.5 rounded-full', tone.dot)} aria-hidden />
      {STATUS_LABELS[status]}
    </span>
  )
}

export function PriorityBadge({
  priority,
  className,
}: {
  priority: TicketPriority
  className?: string
}) {
  return (
    <span className={cn(PILL, PRIORITY_TONE[priority], 'font-semibold', className)}>
      {PRIORITY_SHORT[priority]}
    </span>
  )
}

export function SlaBadge({
  state,
  label,
  className,
}: {
  state: SlaState
  label?: string
  className?: string
}) {
  return (
    <span className={cn(PILL, SLA_TONE[state], className)}>{label ?? SLA_LABELS[state]}</span>
  )
}
