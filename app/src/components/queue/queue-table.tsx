// Dense sortable ticket table with row selection and quick actions.
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { ArrowUpDown, MoreHorizontal, UserRound } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PriorityBadge, SlaBadge, StatusBadge } from '@/components/badges'
import { AgentChip } from '@/components/entity-bits'
import { AssigneePicker } from '@/components/assignee-picker'
import { cn } from '@/lib/utils'
import {
  CATEGORY_LABELS,
  agentById,
  computeSlaState,
  slaCountdown,
} from '@/lib/domain'
import { TICKET_PRIORITIES } from '@/lib/types'
import type { Ticket } from '@/lib/types'
import { useAgents, useCurrentAgentId, useRequesters, useTicketMutations } from '@/data'
import { useUiStore } from '@/lib/ui-store'
import { toast } from 'sonner'

type SortKey = 'priority' | 'sla' | 'updated'
type SortDir = 'asc' | 'desc'

const PRIORITY_RANK: Record<string, number> = { p1: 0, p2: 1, p3: 2, p4: 3 }

function sortTickets(tickets: Ticket[], key: SortKey, dir: SortDir): Ticket[] {
  const factor = dir === 'asc' ? 1 : -1
  return [...tickets].sort((a, b) => {
    if (key === 'priority') return (PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]) * factor
    if (key === 'sla')
      return (
        (new Date(a.resolutionDueAt).getTime() - new Date(b.resolutionDueAt).getTime()) * factor
      )
    return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * factor
  })
}

function SortHeader({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 font-medium transition-colors hover:text-foreground',
        active ? 'text-foreground' : 'text-muted-foreground',
      )}
    >
      {label}
      <ArrowUpDown className="size-3" />
    </button>
  )
}

export function QueueTable({ tickets }: { tickets: Ticket[] }) {
  const navigate = useNavigate()
  const agents = useAgents()
  const requesters = useRequesters()
  const currentAgentId = useCurrentAgentId()
  const { setAssignee } = useTicketMutations()
  const selectedIds = useUiStore((s) => s.selectedIds)
  const toggleSelected = useUiStore((s) => s.toggleSelected)
  const setSelected = useUiStore((s) => s.setSelected)

  const [sortKey, setSortKey] = useState<SortKey>('sla')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const sorted = useMemo(() => sortTickets(tickets, sortKey, sortDir), [tickets, sortKey, sortDir])

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir(key === 'priority' ? 'asc' : 'asc')
  }

  const allSelected = sorted.length > 0 && sorted.every((t) => selectedIds.includes(t.id))

  function handleAssign(ticket: Ticket, agentId: string | null) {
    setAssignee(ticket.id, agentId)
    const name = agentId ? agentById(agents, agentId)?.name ?? 'agent' : 'Unassigned'
    toast.success(`${ticket.id} assigned to ${name}`)
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(v) => setSelected(v ? sorted.map((t) => t.id) : [])}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead className="w-24">ID</TableHead>
            <TableHead className="min-w-[220px]">Subject</TableHead>
            <TableHead className="w-24">
              <SortHeader
                label="Priority"
                active={sortKey === 'priority'}
                onClick={() => handleSort('priority')}
              />
            </TableHead>
            <TableHead className="w-32">Status</TableHead>
            <TableHead className="w-28">Category</TableHead>
            <TableHead className="min-w-[150px]">Assignee</TableHead>
            <TableHead className="w-32">
              <SortHeader label="SLA" active={sortKey === 'sla'} onClick={() => handleSort('sla')} />
            </TableHead>
            <TableHead className="w-28">
              <SortHeader
                label="Updated"
                active={sortKey === 'updated'}
                onClick={() => handleSort('updated')}
              />
            </TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((ticket) => {
            const assignee = agentById(agents, ticket.assigneeId)
            const requester = requesters.find((r) => r.id === ticket.requesterId)
            const sla = computeSlaState(ticket)
            const isSelected = selectedIds.includes(ticket.id)
            return (
              <TableRow
                key={ticket.id}
                data-state={isSelected ? 'selected' : undefined}
                className="cursor-pointer"
                onClick={() => navigate(`/tickets/${ticket.id}`)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelected(ticket.id)}
                    aria-label={`Select ${ticket.id}`}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{ticket.id}</TableCell>
                <TableCell>
                  <div className="max-w-[320px]">
                    <p className="truncate font-medium">{ticket.subject}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {requester?.name ?? 'Unknown'} · {requester?.department ?? ''}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={ticket.priority} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={ticket.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {CATEGORY_LABELS[ticket.category]}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <AssigneePicker
                    currentAssigneeId={ticket.assigneeId}
                    onSelect={(id) => handleAssign(ticket, id)}
                  >
                    <button
                      type="button"
                      className="rounded-md px-1 py-0.5 text-left transition-colors hover:bg-muted"
                    >
                      <AgentChip agent={assignee} />
                    </button>
                  </AssigneePicker>
                </TableCell>
                <TableCell>
                  <SlaBadge state={sla} label={slaCountdown(ticket)} />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8" aria-label="Row actions">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/tickets/${ticket.id}`)}>
                        Open ticket
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAssign(ticket, currentAgentId)}>
                        <UserRound className="size-4" /> Assign to me
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
