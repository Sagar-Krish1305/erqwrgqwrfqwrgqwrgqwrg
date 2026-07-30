// Seed dataset for the Service Desk demo. Dates are computed relative to the moment
// the store first initializes so the SLA countdowns look alive (some breaching, some
// due soon, some resolved today). This runs inside the zustand store, not a useData
// seed, so relative computation is fine.
import type {
  Activity,
  Agent,
  Requester,
  Ticket,
  TicketCategory,
  TicketChannel,
  TicketPriority,
  TicketStatus,
} from '@/lib/types'
import { HOUR_MS, RESPONSE_HOURS, SLA_HOURS } from '@/lib/domain'

export const AGENTS: Agent[] = [
  { id: 'ag-1', name: 'Dana Ruiz', email: 'dana.ruiz@helix.io', role: 'lead', presence: 'online' },
  { id: 'ag-2', name: 'Marcus Bell', email: 'marcus.bell@helix.io', role: 'agent', presence: 'online' },
  { id: 'ag-3', name: 'Priya Nair', email: 'priya.nair@helix.io', role: 'agent', presence: 'away' },
  { id: 'ag-4', name: 'Tomas Vidal', email: 'tomas.vidal@helix.io', role: 'agent', presence: 'online' },
  { id: 'ag-5', name: 'Aisha Kone', email: 'aisha.kone@helix.io', role: 'lead', presence: 'offline' },
  { id: 'ag-6', name: 'Liam Fowler', email: 'liam.fowler@helix.io', role: 'agent', presence: 'online' },
  { id: 'ag-7', name: 'Sofia Marchetti', email: 'sofia.marchetti@helix.io', role: 'agent', presence: 'away' },
  { id: 'ag-8', name: 'Noah Carter', email: 'noah.carter@helix.io', role: 'agent', presence: 'offline' },
]

// The signed-in agent driving "My Tickets" / "Assign to me" / note authorship.
export const CURRENT_AGENT_ID = 'ag-1'

export const REQUESTERS: Requester[] = [
  { id: 'rq-1', name: 'Elena Foster', email: 'elena.foster@acme.com', department: 'Finance' },
  { id: 'rq-2', name: 'Raj Patel', email: 'raj.patel@acme.com', department: 'Sales' },
  { id: 'rq-3', name: 'Mia Chen', email: 'mia.chen@acme.com', department: 'Marketing' },
  { id: 'rq-4', name: 'Ben Ortiz', email: 'ben.ortiz@acme.com', department: 'Engineering' },
  { id: 'rq-5', name: 'Grace Lin', email: 'grace.lin@acme.com', department: 'HR' },
  { id: 'rq-6', name: 'Omar Haddad', email: 'omar.haddad@acme.com', department: 'Operations' },
  { id: 'rq-7', name: 'Chloe Adams', email: 'chloe.adams@acme.com', department: 'Legal' },
  { id: 'rq-8', name: 'David Kim', email: 'david.kim@acme.com', department: 'Engineering' },
  { id: 'rq-9', name: 'Nina Rossi', email: 'nina.rossi@acme.com', department: 'Design' },
  { id: 'rq-10', name: 'Sam Wright', email: 'sam.wright@acme.com', department: 'Support' },
  { id: 'rq-11', name: 'Yuki Tanaka', email: 'yuki.tanaka@acme.com', department: 'Finance' },
  { id: 'rq-12', name: 'Paul Mercer', email: 'paul.mercer@acme.com', department: 'Sales' },
  { id: 'rq-13', name: 'Hana Novak', email: 'hana.novak@acme.com', department: 'IT' },
  { id: 'rq-14', name: 'Leo Bianchi', email: 'leo.bianchi@acme.com', department: 'Facilities' },
]

type SeedRow = {
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  category: TicketCategory
  requesterId: string
  assigneeId: string | null
  channel: TicketChannel
  // hours since now the ticket was created (positive number)
  agedHours: number
  resolutionNote?: string
}

const ROWS: SeedRow[] = [
  { subject: 'Laptop will not power on after update', description: 'User reports their Dell laptop shows a black screen after the overnight Windows update. Battery LED blinks amber.', status: 'in_progress', priority: 'p1', category: 'hardware', requesterId: 'rq-1', assigneeId: 'ag-1', channel: 'phone', agedHours: 3.5 },
  { subject: 'Cannot access shared finance drive', description: 'Permission denied when opening \\\\fileserver\\finance. Started this morning for the whole team.', status: 'open', priority: 'p2', category: 'access', requesterId: 'rq-11', assigneeId: 'ag-2', channel: 'email', agedHours: 6 },
  { subject: 'Outlook stuck on "Trying to connect"', description: 'Email client will not sync. Webmail works fine. Restarted twice.', status: 'in_progress', priority: 'p2', category: 'email', requesterId: 'rq-3', assigneeId: 'ag-3', channel: 'portal', agedHours: 7.2 },
  { subject: 'VPN drops every few minutes', description: 'Remote user loses VPN connection repeatedly, breaking active sessions. Home network is stable.', status: 'open', priority: 'p2', category: 'network', requesterId: 'rq-4', assigneeId: null, channel: 'chat', agedHours: 2 },
  { subject: 'Request: install Adobe Acrobat Pro', description: 'Needs licensed Acrobat Pro for contract review workflow.', status: 'new', priority: 'p4', category: 'software', requesterId: 'rq-7', assigneeId: null, channel: 'portal', agedHours: 1 },
  { subject: 'Password reset for payroll system', description: 'Locked out after too many attempts. Needs urgent reset before payroll run.', status: 'in_progress', priority: 'p1', category: 'access', requesterId: 'rq-5', assigneeId: 'ag-1', channel: 'phone', agedHours: 3.9 },
  { subject: 'Printer on 3rd floor jams constantly', description: 'HP LaserJet by the kitchen jams on every job. Tray realigned already.', status: 'on_hold', priority: 'p3', category: 'hardware', requesterId: 'rq-6', assigneeId: 'ag-4', channel: 'email', agedHours: 20 },
  { subject: 'New hire account setup — Design team', description: 'Provision AD account, email, and Figma seat for incoming designer starting Monday.', status: 'open', priority: 'p3', category: 'access', requesterId: 'rq-9', assigneeId: 'ag-6', channel: 'portal', agedHours: 10 },
  { subject: 'Slack notifications not appearing', description: 'Desktop Slack shows no notification badges or banners. Mobile works.', status: 'new', priority: 'p4', category: 'software', requesterId: 'rq-10', assigneeId: null, channel: 'chat', agedHours: 0.5 },
  { subject: 'Monitor flickering on docking station', description: 'External monitor flickers when docked; fine on direct HDMI. Suspect dock firmware.', status: 'open', priority: 'p3', category: 'hardware', requesterId: 'rq-8', assigneeId: 'ag-2', channel: 'email', agedHours: 14 },
  { subject: 'Guest WiFi not working in Room 4B', description: 'Conference room guest WiFi shows connected but no internet. Client demo in an hour.', status: 'in_progress', priority: 'p1', category: 'network', requesterId: 'rq-2', assigneeId: 'ag-4', channel: 'phone', agedHours: 3.7 },
  { subject: 'Excel crashes opening large workbook', description: 'Excel closes without error when opening the quarterly model (~80MB).', status: 'on_hold', priority: 'p3', category: 'software', requesterId: 'rq-12', assigneeId: 'ag-7', channel: 'email', agedHours: 26 },
  { subject: 'Two-factor app lost after phone upgrade', description: 'User replaced phone and no longer has authenticator codes. Needs MFA re-enrollment.', status: 'open', priority: 'p2', category: 'access', requesterId: 'rq-13', assigneeId: 'ag-6', channel: 'portal', agedHours: 5 },
  { subject: 'Keyboard keys sticking', description: 'Several keys on the mechanical keyboard stick. Requests replacement.', status: 'new', priority: 'p4', category: 'hardware', requesterId: 'rq-14', assigneeId: null, channel: 'portal', agedHours: 4 },
  { subject: 'Website contact form emails not received', description: 'Marketing reports form submissions stopped arriving in the shared inbox two days ago.', status: 'in_progress', priority: 'p2', category: 'email', requesterId: 'rq-3', assigneeId: 'ag-3', channel: 'email', agedHours: 9 },
  { subject: 'Zoom audio echo in meetings', description: 'Persistent echo on Zoom calls from meeting room A speakerphone.', status: 'open', priority: 'p3', category: 'software', requesterId: 'rq-6', assigneeId: 'ag-7', channel: 'chat', agedHours: 18 },
  { subject: 'Access request: Salesforce reports', description: 'Sales rep needs read access to the regional pipeline reports folder.', status: 'resolved', priority: 'p4', category: 'access', requesterId: 'rq-12', assigneeId: 'ag-2', channel: 'portal', agedHours: 30, resolutionNote: 'Granted read access to Regional Pipeline report folder and confirmed with user.' },
  { subject: 'Company-wide email delays', description: 'Outbound email delayed 20-40 minutes across the org. Mail queue backing up.', status: 'resolved', priority: 'p1', category: 'email', requesterId: 'rq-1', assigneeId: 'ag-1', channel: 'phone', agedHours: 5.5, resolutionNote: 'Cleared stuck message in transport queue and restarted the connector. Flow back to normal.' },
  { subject: 'Docking station not charging laptop', description: 'Laptop does not charge through the dock; charges fine on wall adapter.', status: 'resolved', priority: 'p3', category: 'hardware', requesterId: 'rq-8', assigneeId: 'ag-4', channel: 'email', agedHours: 22, resolutionNote: 'Replaced faulty USB-C dock cable. Charging confirmed.' },
  { subject: 'Cannot print to networked plotter', description: 'Engineering plotter offline in print dialog. Others on same subnet fine.', status: 'closed', priority: 'p3', category: 'network', requesterId: 'rq-4', assigneeId: 'ag-6', channel: 'portal', agedHours: 48, resolutionNote: 'Reinstalled plotter driver and re-added TCP/IP port. Verified test print.' },
  { subject: 'Teams meeting recordings missing', description: 'Recorded Teams meetings not showing in OneDrive for the user.', status: 'closed', priority: 'p4', category: 'software', requesterId: 'rq-5', assigneeId: 'ag-7', channel: 'chat', agedHours: 60, resolutionNote: 'Recordings were in a different SharePoint library; shared the correct link.' },
  { subject: 'Slow internet in west wing', description: 'Multiple users report sluggish browsing and video calls in the west wing only.', status: 'open', priority: 'p2', category: 'network', requesterId: 'rq-6', assigneeId: null, channel: 'email', agedHours: 1.5 },
  { subject: 'Request new company phone', description: 'Field sales rep needs a replacement work phone; current one has a cracked screen.', status: 'new', priority: 'p4', category: 'hardware', requesterId: 'rq-2', assigneeId: null, channel: 'portal', agedHours: 8 },
  { subject: 'Shared mailbox permissions for Support', description: 'Two new support staff need send-as rights on support@acme.com.', status: 'in_progress', priority: 'p3', category: 'email', requesterId: 'rq-10', assigneeId: 'ag-3', channel: 'portal', agedHours: 12 },
  { subject: 'Antivirus flagging internal tool', description: 'Endpoint AV quarantines our internal deploy script as a threat. Needs allowlist.', status: 'on_hold', priority: 'p2', category: 'software', requesterId: 'rq-4', assigneeId: 'ag-2', channel: 'chat', agedHours: 16 },
  { subject: 'Badge access denied at side entrance', description: 'Employee badge rejected at the east side door; works at main entrance.', status: 'open', priority: 'p3', category: 'access', requesterId: 'rq-14', assigneeId: 'ag-6', channel: 'phone', agedHours: 6.5 },
  { subject: 'Duplicate charges on SaaS renewal', description: 'Finance sees a duplicate invoice for a design tool subscription.', status: 'new', priority: 'p3', category: 'other', requesterId: 'rq-11', assigneeId: null, channel: 'email', agedHours: 3 },
  { subject: 'Onboard laptop imaging batch', description: 'Prepare and image 6 laptops for the incoming support cohort next week.', status: 'open', priority: 'p4', category: 'hardware', requesterId: 'rq-13', assigneeId: 'ag-4', channel: 'portal', agedHours: 28 },
]

function iso(ms: number): string {
  return new Date(ms).toISOString()
}

export function buildSeedTickets(now: number = Date.now()): Ticket[] {
  return ROWS.map((row, index) => {
    const createdAt = now - row.agedHours * HOUR_MS
    const resolutionDueAt = createdAt + SLA_HOURS[row.priority] * HOUR_MS
    const responseDueAt = createdAt + RESPONSE_HOURS[row.priority] * HOUR_MS
    const terminal = row.status === 'resolved' || row.status === 'closed'
    const resolvedAt = terminal ? iso(createdAt + SLA_HOURS[row.priority] * HOUR_MS * 0.6) : null
    const updatedAt = terminal ? resolvedAt! : iso(now - row.agedHours * HOUR_MS * 0.3)
    const num = 1042 + index
    return {
      id: `INC-${num}`,
      subject: row.subject,
      description: row.description,
      status: row.status,
      priority: row.priority,
      category: row.category,
      requesterId: row.requesterId,
      assigneeId: row.assigneeId,
      channel: row.channel,
      createdAt: iso(createdAt),
      updatedAt,
      responseDueAt: iso(responseDueAt),
      resolutionDueAt: iso(resolutionDueAt),
      resolvedAt,
      resolutionNote: row.resolutionNote ?? null,
    }
  })
}

// A believable spread of activity per ticket: an opening system event, a reply/note or
// two, and resolution events for terminal tickets.
const NOTE_BODIES = [
  'Reached out to the requester to confirm the exact error message.',
  'Reproduced the issue on a test machine — looks environment specific.',
  'Escalated to the network team for a deeper look at the switch config.',
  'Applied the standard fix and asked the user to verify.',
  'Waiting on vendor support to respond to our ticket.',
  'Rolled back the last change; monitoring for recurrence.',
]

const REPLY_BODIES = [
  'Thanks for reporting this — I\'m looking into it now and will update you shortly.',
  'Could you let me know if this happens on other devices as well?',
  'We\'ve applied a fix on our end. Please try again and let us know.',
  'I\'ve scheduled a remote session for this afternoon to take a closer look.',
]

export function buildSeedActivities(tickets: Ticket[], now: number = Date.now()): Activity[] {
  const activities: Activity[] = []
  let counter = 1
  tickets.forEach((ticket) => {
    const created = new Date(ticket.createdAt).getTime()
    const assignee = ticket.assigneeId ?? 'ag-1'
    activities.push({
      id: `act-${counter++}`,
      ticketId: ticket.id,
      type: 'system',
      authorId: assignee,
      body: `Ticket created via ${ticket.channel}`,
      createdAt: iso(created),
    })
    if (ticket.assigneeId) {
      activities.push({
        id: `act-${counter++}`,
        ticketId: ticket.id,
        type: 'system',
        authorId: assignee,
        body: 'Ticket assigned',
        createdAt: iso(created + HOUR_MS * 0.2),
      })
      activities.push({
        id: `act-${counter++}`,
        ticketId: ticket.id,
        type: 'reply',
        authorId: assignee,
        body: REPLY_BODIES[counter % REPLY_BODIES.length],
        createdAt: iso(created + HOUR_MS * 0.5),
      })
      activities.push({
        id: `act-${counter++}`,
        ticketId: ticket.id,
        type: 'note',
        authorId: assignee,
        body: NOTE_BODIES[counter % NOTE_BODIES.length],
        createdAt: iso(created + HOUR_MS * 0.9),
      })
    }
    if (ticket.resolvedAt) {
      activities.push({
        id: `act-${counter++}`,
        ticketId: ticket.id,
        type: 'system',
        authorId: assignee,
        body: 'Ticket resolved',
        createdAt: ticket.resolvedAt,
      })
    }
  })
  return activities.filter((a) => new Date(a.createdAt).getTime() <= now || true)
}
