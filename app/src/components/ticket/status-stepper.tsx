// Lifecycle stepper: New → Open → In Progress → On Hold → Resolved → Closed.
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TICKET_STATUSES } from '@/lib/types'
import { STATUS_LABELS } from '@/lib/domain'
import type { Ticket } from '@/lib/types'

export function StatusStepper({ status }: { status: Ticket['status'] }) {
  const currentIndex = TICKET_STATUSES.indexOf(status)
  return (
    <ol className="flex flex-wrap items-center gap-x-1 gap-y-2">
      {TICKET_STATUSES.map((s, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        return (
          <li key={s} className="flex items-center gap-1">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                active && 'bg-primary text-primary-foreground',
                done && 'bg-[color-mix(in_srgb,var(--chart-1),transparent_86%)] text-[var(--chart-1)]',
                !active && !done && 'bg-muted text-muted-foreground',
              )}
            >
              {done && <Check className="size-3" />}
              {STATUS_LABELS[s]}
            </span>
            {i < TICKET_STATUSES.length - 1 && (
              <span className="h-px w-3 bg-border" aria-hidden />
            )}
          </li>
        )
      })}
    </ol>
  )
}
