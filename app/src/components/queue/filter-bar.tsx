// Queue filter bar: search + status/priority/category/assignee selects.
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUiStore, DEFAULT_FILTERS } from '@/lib/ui-store'
import { TICKET_STATUSES, TICKET_PRIORITIES, TICKET_CATEGORIES } from '@/lib/types'
import { STATUS_LABELS, PRIORITY_SHORT, CATEGORY_LABELS } from '@/lib/domain'
import { useAgents } from '@/data'

const ALL = 'all'

export function FilterBar() {
  const filters = useUiStore((s) => s.filters)
  const setFilters = useUiStore((s) => s.setFilters)
  const agents = useAgents()

  const hasActiveFilters =
    filters.search !== '' ||
    filters.status !== ALL ||
    filters.priority !== ALL ||
    filters.category !== ALL ||
    filters.assigneeId !== ALL

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[200px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          placeholder="Search ID or subject…"
          className="pl-9"
          aria-label="Search tickets"
        />
      </div>

      <Select value={filters.status} onValueChange={(v) => setFilters({ status: v as never })}>
        <SelectTrigger className="w-[140px]" aria-label="Filter by status">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          {TICKET_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.priority} onValueChange={(v) => setFilters({ priority: v as never })}>
        <SelectTrigger className="w-[130px]" aria-label="Filter by priority">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All priorities</SelectItem>
          {TICKET_PRIORITIES.map((p) => (
            <SelectItem key={p} value={p}>
              {PRIORITY_SHORT[p]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.category} onValueChange={(v) => setFilters({ category: v as never })}>
        <SelectTrigger className="w-[140px]" aria-label="Filter by category">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All categories</SelectItem>
          {TICKET_CATEGORIES.map((c) => (
            <SelectItem key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.assigneeId} onValueChange={(v) => setFilters({ assigneeId: v })}>
        <SelectTrigger className="w-[150px]" aria-label="Filter by assignee">
          <SelectValue placeholder="Assignee" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All assignees</SelectItem>
          {agents.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setFilters({
              search: '',
              status: DEFAULT_FILTERS.status,
              priority: DEFAULT_FILTERS.priority,
              category: DEFAULT_FILTERS.category,
              assigneeId: DEFAULT_FILTERS.assigneeId,
            })
          }
        >
          <X className="size-4" /> Clear
        </Button>
      )}
    </div>
  )
}
