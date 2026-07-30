// App data hooks — read the domain store, derive views/KPIs/series in the component
// layer. Selectors return raw slices (stable refs); derivation happens in useMemo here.
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useDataStore } from '@/lib/store'
import { useUiStore } from '@/lib/ui-store'
import type { QueueFilters } from '@/lib/ui-store'
import type { Activity, Agent, Requester, Ticket } from '@/lib/types'
import { TICKET_STATUSES, TICKET_PRIORITIES } from '@/lib/types'
import {
  STATUS_LABELS,
  PRIORITY_SHORT,
  agentById,
  agentOpenLoad,
  computeSlaState,
  isOpenStatus,
  isTerminal,
  sortActivitiesDesc,
} from '@/lib/domain'
import { isToday } from 'date-fns'

export function useTickets(): Ticket[] {
  return useDataStore((s) => s.tickets)
}

export function useAgents(): Agent[] {
  return useDataStore((s) => s.agents)
}

export function useRequesters(): Requester[] {
  return useDataStore((s) => s.requesters)
}

export function useCurrentAgentId(): string {
  return useDataStore((s) => s.currentAgentId)
}

export function useCurrentAgent(): Agent | undefined {
  const id = useCurrentAgentId()
  const agents = useAgents()
  return agentById(agents, id)
}

export function useTicket(id: string | undefined): Ticket | undefined {
  const tickets = useTickets()
  return useMemo(() => tickets.find((t) => t.id === id), [tickets, id])
}

export function useTicketActivities(ticketId: string | undefined): Activity[] {
  const activities = useDataStore((s) => s.activities)
  return useMemo(
    () => (ticketId ? sortActivitiesDesc(activities.filter((a) => a.ticketId === ticketId)) : []),
    [activities, ticketId],
  )
}

function matchesView(
  ticket: Ticket,
  view: QueueFilters['view'],
  currentAgentId: string,
  now: number,
): boolean {
  switch (view) {
    case 'mine':
      return ticket.assigneeId === currentAgentId && isOpenStatus(ticket.status)
    case 'unassigned':
      return ticket.assigneeId === null && isOpenStatus(ticket.status)
    case 'breaching': {
      const sla = computeSlaState(ticket, now)
      return sla === 'breached' || sla === 'warning'
    }
    case 'resolved':
      return isTerminal(ticket.status)
    case 'all':
    default:
      return true
  }
}

export function useFilteredTickets(): { tickets: Ticket[]; total: number } {
  const tickets = useTickets()
  const filters = useUiStore((s) => s.filters)
  const currentAgentId = useCurrentAgentId()

  return useMemo(() => {
    const now = Date.now()
    const q = filters.search.trim().toLowerCase()
    const result = tickets.filter((t) => {
      if (!matchesView(t, filters.view, currentAgentId, now)) return false
      if (filters.status !== 'all' && t.status !== filters.status) return false
      if (filters.priority !== 'all' && t.priority !== filters.priority) return false
      if (filters.category !== 'all' && t.category !== filters.category) return false
      if (filters.assigneeId !== 'all' && t.assigneeId !== filters.assigneeId) return false
      if (q) {
        const hay = `${t.id} ${t.subject}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    return { tickets: result, total: tickets.length }
  }, [tickets, filters, currentAgentId])
}

export type AgentLoad = Agent & { openLoad: number }

export function useAgentLoads(): AgentLoad[] {
  const agents = useAgents()
  const tickets = useTickets()
  return useMemo(
    () => agents.map((a) => ({ ...a, openLoad: agentOpenLoad(a.id, tickets) })),
    [agents, tickets],
  )
}

export type DashboardData = {
  openCount: number
  unassignedCount: number
  breachingCount: number
  resolvedTodayCount: number
  byStatus: { key: string; label: string; count: number }[]
  byPriority: { key: string; label: string; count: number }[]
  slaOnTrack: number
  slaWarning: number
  slaBreached: number
  myOpen: Ticket[]
}

export function useDashboardData(): DashboardData {
  const tickets = useTickets()
  const currentAgentId = useCurrentAgentId()
  return useMemo(() => {
    const now = Date.now()
    const open = tickets.filter((t) => isOpenStatus(t.status))
    let slaOnTrack = 0
    let slaWarning = 0
    let slaBreached = 0
    open.forEach((t) => {
      const sla = computeSlaState(t, now)
      if (sla === 'breached') slaBreached += 1
      else if (sla === 'warning') slaWarning += 1
      else slaOnTrack += 1
    })
    const byStatus = TICKET_STATUSES.map((key) => ({
      key,
      label: STATUS_LABELS[key],
      count: tickets.filter((t) => t.status === key).length,
    }))
    const byPriority = TICKET_PRIORITIES.map((key) => ({
      key,
      label: PRIORITY_SHORT[key],
      count: open.filter((t) => t.priority === key).length,
    }))
    return {
      openCount: open.length,
      unassignedCount: open.filter((t) => t.assigneeId === null).length,
      breachingCount: slaBreached + slaWarning,
      resolvedTodayCount: tickets.filter(
        (t) => t.resolvedAt !== null && isToday(new Date(t.resolvedAt)),
      ).length,
      byStatus,
      byPriority,
      slaOnTrack,
      slaWarning,
      slaBreached,
      myOpen: open
        .filter((t) => t.assigneeId === currentAgentId)
        .sort(
          (a, b) =>
            new Date(a.resolutionDueAt).getTime() - new Date(b.resolutionDueAt).getTime(),
        ),
    }
  }, [tickets, currentAgentId])
}

export function useRecentActivity(limit: number): (Activity & { ticket?: Ticket })[] {
  const activities = useDataStore((s) => s.activities)
  const tickets = useTickets()
  return useMemo(() => {
    const sorted = sortActivitiesDesc(activities).slice(0, limit)
    return sorted.map((a) => ({ ...a, ticket: tickets.find((t) => t.id === a.ticketId) }))
  }, [activities, tickets, limit])
}

// Mutations — thin re-exports of store actions so components import from @/data only.
export function useTicketMutations() {
  return useDataStore(
    useShallow((s) => ({
      createTicket: s.createTicket,
      setStatus: s.setStatus,
      setAssignee: s.setAssignee,
      bulkSetStatus: s.bulkSetStatus,
      bulkSetAssignee: s.bulkSetAssignee,
      addActivity: s.addActivity,
      updateTicket: s.updateTicket,
    })),
  )
}

export function useResetDemoData() {
  return useDataStore((s) => s.resetDemoData)
}
