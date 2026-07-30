import { Link } from 'react-router-dom'
import { Inbox, Plus } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FilterBar } from '@/components/queue/filter-bar'
import { QueueTable } from '@/components/queue/queue-table'
import { BulkToolbar } from '@/components/queue/bulk-toolbar'
import { SAVED_VIEWS, SAVED_VIEW_LABELS, useUiStore } from '@/lib/ui-store'
import type { SavedView } from '@/lib/ui-store'
import { useFilteredTickets } from '@/data'

const EMPTY_COPY: Record<SavedView, string> = {
  all: 'No tickets match your filters. Try clearing them.',
  mine: "You have no open tickets assigned. Grab one from the queue.",
  unassigned: "No unassigned tickets — nice, the queue's clear.",
  breaching: 'No tickets are breaching or due soon. SLAs are healthy.',
  resolved: 'No resolved or closed tickets yet.',
}

export default function Tickets() {
  const { tickets, total } = useFilteredTickets()
  const filters = useUiStore((s) => s.filters)
  const setFilters = useUiStore((s) => s.setFilters)
  const clearSelected = useUiStore((s) => s.clearSelected)

  function handleViewChange(value: string) {
    clearSelected()
    setFilters({ view: value as SavedView })
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Ticket queue"
        description={`${tickets.length} of ${total} incidents shown.`}
        actions={
          <Button asChild size="sm">
            <Link to="/tickets/new">
              <Plus className="size-4" /> New ticket
            </Link>
          </Button>
        }
      />

      <Tabs value={filters.view} onValueChange={handleViewChange}>
        <TabsList>
          {SAVED_VIEWS.map((v) => (
            <TabsTrigger key={v} value={v}>
              {SAVED_VIEW_LABELS[v]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <FilterBar />
      <BulkToolbar />

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
          <Inbox className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{EMPTY_COPY[filters.view]}</p>
          <Button asChild variant="outline" size="sm">
            <Link to="/tickets/new">Log a ticket</Link>
          </Button>
        </div>
      ) : (
        <QueueTable tickets={tickets} />
      )}
    </div>
  )
}
