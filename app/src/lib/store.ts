// Domain data store (persisted to localStorage) + ephemeral UI state store.
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Activity, Agent, Requester, Ticket, TicketStatus } from '@/lib/types'
import {
  AGENTS,
  CURRENT_AGENT_ID,
  REQUESTERS,
  buildSeedActivities,
  buildSeedTickets,
} from '@/lib/seed'
import { RESPONSE_HOURS, SLA_HOURS, HOUR_MS, STATUS_LABELS, agentById } from '@/lib/domain'

const STORAGE_KEY = 'service-desk-store-v1'

function freshData() {
  const now = Date.now()
  const tickets = buildSeedTickets(now)
  const activities = buildSeedActivities(tickets, now)
  return { tickets, activities }
}

export type NewTicketInput = {
  subject: string
  description: string
  requesterId: string
  category: Ticket['category']
  priority: Ticket['priority']
  assigneeId: string | null
  channel: Ticket['channel']
}

type DataState = {
  tickets: Ticket[]
  activities: Activity[]
  agents: Agent[]
  requesters: Requester[]
  currentAgentId: string
  createTicket: (input: NewTicketInput) => Ticket
  updateTicket: (id: string, patch: Partial<Ticket>, systemNote?: string) => void
  setStatus: (id: string, status: TicketStatus, resolutionNote?: string) => void
  setAssignee: (id: string, assigneeId: string | null) => void
  bulkSetStatus: (ids: string[], status: TicketStatus) => void
  bulkSetAssignee: (ids: string[], assigneeId: string | null) => void
  addActivity: (ticketId: string, type: Activity['type'], body: string) => void
  resetDemoData: () => void
}

let activitySeq = Date.now()
function nextActivityId(): string {
  activitySeq += 1
  return `act-u-${activitySeq}`
}

function nextIncId(tickets: Ticket[]): string {
  const max = tickets.reduce((acc, t) => {
    const n = Number.parseInt(t.id.replace('INC-', ''), 10)
    return Number.isFinite(n) && n > acc ? n : acc
  }, 1041)
  return `INC-${max + 1}`
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      ...freshData(),
      agents: AGENTS,
      requesters: REQUESTERS,
      currentAgentId: CURRENT_AGENT_ID,

      createTicket: (input) => {
        const now = Date.now()
        const id = nextIncId(get().tickets)
        const ticket: Ticket = {
          id,
          subject: input.subject,
          description: input.description,
          status: 'new',
          priority: input.priority,
          category: input.category,
          requesterId: input.requesterId,
          assigneeId: input.assigneeId,
          channel: input.channel,
          createdAt: new Date(now).toISOString(),
          updatedAt: new Date(now).toISOString(),
          responseDueAt: new Date(now + RESPONSE_HOURS[input.priority] * HOUR_MS).toISOString(),
          resolutionDueAt: new Date(now + SLA_HOURS[input.priority] * HOUR_MS).toISOString(),
          resolvedAt: null,
          resolutionNote: null,
        }
        const openEvent: Activity = {
          id: nextActivityId(),
          ticketId: id,
          type: 'system',
          authorId: get().currentAgentId,
          body: `Ticket created via ${input.channel}`,
          createdAt: new Date(now).toISOString(),
        }
        set((s) => ({ tickets: [ticket, ...s.tickets], activities: [...s.activities, openEvent] }))
        if (input.assigneeId) {
          get().setAssignee(id, input.assigneeId)
        }
        return ticket
      },

      addActivity: (ticketId, type, body) => {
        const activity: Activity = {
          id: nextActivityId(),
          ticketId,
          type,
          authorId: get().currentAgentId,
          body,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({
          activities: [...s.activities, activity],
          tickets: s.tickets.map((t) =>
            t.id === ticketId ? { ...t, updatedAt: activity.createdAt } : t,
          ),
        }))
      },

      updateTicket: (id, patch, systemNote) => {
        const now = new Date().toISOString()
        set((s) => ({
          tickets: s.tickets.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: now } : t)),
        }))
        if (systemNote) {
          get().addActivity(id, 'system', systemNote)
        }
      },

      setStatus: (id, status, resolutionNote) => {
        const ticket = get().tickets.find((t) => t.id === id)
        if (!ticket || ticket.status === status) return
        const patch: Partial<Ticket> = { status }
        if (status === 'resolved') {
          patch.resolvedAt = new Date().toISOString()
          patch.resolutionNote = resolutionNote ?? null
        }
        if (status === 'closed') {
          patch.resolvedAt = ticket.resolvedAt ?? new Date().toISOString()
        }
        if (status === 'open' || status === 'in_progress') {
          patch.resolvedAt = null
          patch.resolutionNote = null
        }
        get().updateTicket(
          id,
          patch,
          `Status changed ${STATUS_LABELS[ticket.status]} → ${STATUS_LABELS[status]}`,
        )
      },

      setAssignee: (id, assigneeId) => {
        const ticket = get().tickets.find((t) => t.id === id)
        if (!ticket) return
        const agents = get().agents
        const toName = assigneeId ? agentById(agents, assigneeId)?.name ?? 'someone' : 'Unassigned'
        get().updateTicket(id, { assigneeId }, `Assignee changed to ${toName}`)
      },

      bulkSetStatus: (ids, status) => {
        ids.forEach((id) => get().setStatus(id, status))
      },

      bulkSetAssignee: (ids, assigneeId) => {
        ids.forEach((id) => get().setAssignee(id, assigneeId))
      },

      resetDemoData: () => {
        const data = freshData()
        set({ tickets: data.tickets, activities: data.activities })
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({
        tickets: s.tickets,
        activities: s.activities,
        currentAgentId: s.currentAgentId,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<DataState> | undefined
        if (!p || !Array.isArray(p.tickets) || p.tickets.length === 0) {
          return current
        }
        return { ...current, ...p }
      },
    },
  ),
)
