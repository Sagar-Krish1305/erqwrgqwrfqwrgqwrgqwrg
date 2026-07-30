// Clickable KPI tiles — each deep-links to the queue with a matching filter applied.
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Inbox, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/lib/ui-store'
import type { QueueFilters } from '@/lib/ui-store'
import type { DashboardData } from '@/data'

type Tile = {
  key: string
  label: string
  value: number
  icon: typeof Inbox
  accent: string
  deepLink: Partial<QueueFilters>
}

export function KpiTiles({ data }: { data: DashboardData }) {
  const navigate = useNavigate()
  const applyDeepLink = useUiStore((s) => s.applyDeepLink)

  const tiles: Tile[] = [
    {
      key: 'open',
      label: 'Open tickets',
      value: data.openCount,
      icon: Inbox,
      accent: 'text-[var(--chart-2)]',
      deepLink: { view: 'all', status: 'all' },
    },
    {
      key: 'unassigned',
      label: 'Unassigned',
      value: data.unassignedCount,
      icon: UserPlus,
      accent: 'text-[var(--chart-3)]',
      deepLink: { view: 'unassigned' },
    },
    {
      key: 'breaching',
      label: 'Breaching SLA',
      value: data.breachingCount,
      icon: AlertTriangle,
      accent: 'text-[var(--destructive)]',
      deepLink: { view: 'breaching' },
    },
    {
      key: 'resolved',
      label: 'Resolved today',
      value: data.resolvedTodayCount,
      icon: CheckCircle2,
      accent: 'text-[var(--chart-1)]',
      deepLink: { view: 'resolved' },
    },
  ]

  function handleClick(tile: Tile) {
    applyDeepLink(tile.deepLink)
    navigate('/tickets')
  }

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {tiles.map((tile) => (
        <button
          key={tile.key}
          type="button"
          onClick={() => handleClick(tile)}
          className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-5 text-left transition-colors hover:border-primary/40 hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{tile.label}</span>
            <tile.icon className={cn('size-4', tile.accent)} />
          </div>
          <span className="font-heading text-3xl font-semibold tabular-nums">{tile.value}</span>
        </button>
      ))}
    </div>
  )
}
