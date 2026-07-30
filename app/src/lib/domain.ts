// Domain constants, labels, and derivation helpers (SLA, formatting, transitions).
import type {
  Activity,
  Agent,
  SlaState,
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '@/lib/types'

export const STATUS_LABELS: Record<TicketStatus, string> = {
  new: 'New',
  open: 'Open',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  resolved: 'Resolved',
  closed: 'Closed',
}

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  p1: 'P1 · Critical',
  p2: 'P2 · High',
  p3: 'P3 · Normal',
  p4: 'P4 · Low',
}

export const PRIORITY_SHORT: Record<TicketPriority, string> = {
  p1: 'P1',
  p2: 'P2',
  p3: 'P3',
  p4: 'P4',
}

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  hardware: 'Hardware',
  software: 'Software',
  network: 'Network',
  access: 'Access',
  email: 'Email',
  other: 'Other',
}

// Priority -> resolution window in hours.
export const SLA_HOURS: Record<TicketPriority, number> = {
  p1: 4,
  p2: 8,
  p3: 24,
  p4: 72,
}

// Response window is a fraction of the resolution window.
export const RESPONSE_HOURS: Record<TicketPriority, number> = {
  p1: 1,
  p2: 2,
  p3: 4,
  p4: 8,
}

export const WARNING_THRESHOLD = 0.2 // 20% of window remaining
export const HOUR_MS = 60 * 60 * 1000

// A ticket in one of these statuses is "closed out" — SLA no longer counts down.
const TERMINAL_STATUSES: TicketStatus[] = ['resolved', 'closed']

export function isTerminal(status: TicketStatus): boolean {
  return TERMINAL_STATUSES.includes(status)
}

export function isOpenStatus(status: TicketStatus): boolean {
  return !isTerminal(status)
}

// Allowed forward/side transitions. Closed requires an explicit reopen to New/Open.
const TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  new: ['open', 'in_progress', 'on_hold', 'resolved'],
  open: ['in_progress', 'on_hold', 'resolved'],
  in_progress: ['on_hold', 'resolved', 'open'],
  on_hold: ['in_progress', 'open', 'resolved'],
  resolved: ['closed', 'open'],
  closed: ['open'],
}

export function canTransition(from: TicketStatus, to: TicketStatus): boolean {
  if (from === to) return true
  return TRANSITIONS[from].includes(to)
}

export function allowedTransitions(from: TicketStatus): TicketStatus[] {
  return [from, ...TRANSITIONS[from]]
}

export function computeSlaState(ticket: Ticket, now: number = Date.now()): SlaState {
  if (isTerminal(ticket.status)) return 'met'
  const due = new Date(ticket.resolutionDueAt).getTime()
  const created = new Date(ticket.createdAt).getTime()
  const total = due - created
  const remaining = due - now
  if (remaining <= 0) return 'breached'
  if (total > 0 && remaining / total <= WARNING_THRESHOLD) return 'warning'
  return 'on_track'
}

export const SLA_LABELS: Record<SlaState, string> = {
  on_track: 'On track',
  warning: 'Due soon',
  breached: 'Breached',
  met: 'Met',
}

// Human short countdown, e.g. "3h 12m left" or "2h overdue".
export function slaCountdown(ticket: Ticket, now: number = Date.now()): string {
  if (isTerminal(ticket.status)) return 'Resolved'
  const due = new Date(ticket.resolutionDueAt).getTime()
  const diff = due - now
  const overdue = diff < 0
  const abs = Math.abs(diff)
  const hours = Math.floor(abs / HOUR_MS)
  const mins = Math.floor((abs % HOUR_MS) / (60 * 1000))
  const label = hours >= 1 ? `${hours}h ${mins}m` : `${mins}m`
  return overdue ? `${label} overdue` : `${label} left`
}

export function agentInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// Derived: number of open tickets assigned to an agent.
export function agentOpenLoad(agentId: string, tickets: Ticket[]): number {
  return tickets.filter((t) => t.assigneeId === agentId && isOpenStatus(t.status)).length
}

export function sortActivitiesDesc(activities: Activity[]): Activity[] {
  return [...activities].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function agentById(agents: Agent[], id: string | null): Agent | undefined {
  if (!id) return undefined
  return agents.find((a) => a.id === id)
}
