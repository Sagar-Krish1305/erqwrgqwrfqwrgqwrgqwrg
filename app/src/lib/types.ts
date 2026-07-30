// Domain types for the Service Desk ITSM app. Statuses/priorities are `as const`
// unions (never enums — the build rejects enum under erasableSyntaxOnly).

export const TICKET_STATUSES = [
  'new',
  'open',
  'in_progress',
  'on_hold',
  'resolved',
  'closed',
] as const
export type TicketStatus = (typeof TICKET_STATUSES)[number]

export const TICKET_PRIORITIES = ['p1', 'p2', 'p3', 'p4'] as const
export type TicketPriority = (typeof TICKET_PRIORITIES)[number]

export const TICKET_CATEGORIES = [
  'hardware',
  'software',
  'network',
  'access',
  'email',
  'other',
] as const
export type TicketCategory = (typeof TICKET_CATEGORIES)[number]

export const TICKET_CHANNELS = ['email', 'phone', 'portal', 'chat'] as const
export type TicketChannel = (typeof TICKET_CHANNELS)[number]

export const ACTIVITY_TYPES = ['reply', 'note', 'system'] as const
export type ActivityType = (typeof ACTIVITY_TYPES)[number]

export const AGENT_ROLES = ['agent', 'lead'] as const
export type AgentRole = (typeof AGENT_ROLES)[number]

export const PRESENCE = ['online', 'away', 'offline'] as const
export type Presence = (typeof PRESENCE)[number]

export type SlaState = 'on_track' | 'warning' | 'breached' | 'met'

export interface Ticket {
  id: string
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  category: TicketCategory
  requesterId: string
  assigneeId: string | null
  channel: TicketChannel
  createdAt: string
  updatedAt: string
  responseDueAt: string
  resolutionDueAt: string
  resolvedAt: string | null
  resolutionNote: string | null
}

export interface Activity {
  id: string
  ticketId: string
  type: ActivityType
  authorId: string
  body: string
  createdAt: string
}

export interface Agent {
  id: string
  name: string
  email: string
  role: AgentRole
  presence: Presence
}

export interface Requester {
  id: string
  name: string
  email: string
  department: string
}
