# PLAN — Service Desk

## APP
- Name: Service Desk
- An ITSM incident/ticket-management workspace for IT service-desk agents: a live
  queue, a focused ticket workspace, triage & assignment, status/priority/SLA workflow,
  and a shift dashboard.
- Target users: service-desk agents (work tickets) and team leads/dispatchers (triage,
  balance load, watch SLAs).
- Primary device: desktop (dense data-work tool); fully responsive down to tablet/mobile
  with a collapsible sidebar and card-stacked tables.

## FEATURES

1. **Ticket queue (browse, filter, sort)**
   Central table of all incidents showing ID (e.g. INC-1042), subject, requester,
   status, priority, category, assignee, SLA countdown, and updated time. Supports
   free-text search (subject/ID/requester), and filtering by status, priority,
   category, and assignee. Column sorting on priority, SLA, and updated. Saved views as
   tabs: **All**, **My Tickets**, **Unassigned**, **Breaching**, **Resolved/Closed**.
   *Acceptance:* changing any filter updates the list and the visible row count without a
   reload; "Unassigned" shows only tickets with no assignee; "Breaching" shows tickets
   past due or due within the warning window; search matches ID/subject/requester
   substring, case-insensitive; empty result shows a real empty state.

2. **Ticket detail & workflow**
   Full workspace for one ticket: subject, rich description, requester block, and a
   right-hand **properties panel** to change status, priority, assignee, and category
   inline. A live **SLA panel** shows response/resolution due time and a color-coded
   countdown (on-track / warning / breached). A **status stepper** reflects the
   lifecycle: New → Open → In Progress → On Hold → Resolved → Closed.
   *Acceptance:* editing any property persists immediately and appends a system entry to
   the activity timeline (e.g. "Priority changed P3 → P1 by Dana Ruiz"); resolving a
   ticket requires a resolution note; SLA countdown recolors as it crosses warning and
   breach thresholds; invalid transitions (e.g. Closed → In Progress without reopen) are
   prevented.

3. **Activity timeline & work notes**
   Chronological feed on the ticket combining public replies, internal work notes, and
   system events (status/assignment/priority changes). A composer lets the agent add a
   **public reply** or an **internal note** (visually distinct), each tagged with author
   and relative time.
   *Acceptance:* posting a note prepends/appends it to the timeline with author + "just
   now"; note type (reply vs internal) is visually distinguished; system events are
   auto-generated, not hand-typed; empty timeline shows guidance.

4. **Create / log ticket**
   Form to log an incident on a requester's behalf: subject (required), description
   (required), requester (select from directory), category, priority (default P3),
   optional initial assignee. On submit, generates the next INC-#### id, sets status New,
   stamps created time, computes SLA due dates from priority, and routes to the new
   ticket's detail.
   *Acceptance:* subject/description/requester required with inline validation; amount of
   generated id is sequential and unique; SLA due dates derive from a priority→duration
   map; success toast + navigation to detail; cancel returns to queue with no ticket
   created.

5. **Assignment & triage**
   Assign or reassign a ticket to an agent from the queue (row action) or detail
   (properties panel). "Assign to me" quick action. Bulk-select rows in the queue to
   reassign or change status for several tickets at once.
   *Acceptance:* assigning updates assignee + logs a system event; "Assign to me" uses
   the current signed-in agent; bulk action shows a selection count and confirms before
   applying; reassignment moves the ticket in/out of the "My Tickets" and "Unassigned"
   views correctly.

6. **Dashboard (shift overview)**
   Landing screen with KPI stat tiles (Open, Unassigned, Breaching, Resolved today), a
   **tickets-by-status** bar chart, a **tickets-by-priority** donut, an **SLA health**
   summary, a compact "My open tickets" list, and a recent-activity feed.
   *Acceptance:* every tile/chart is computed from the live ticket set (not hardcoded);
   clicking a stat tile deep-links to the queue with the matching filter applied; charts
   use the chart-1..5 tokens; loading shows skeletons, never spinners over content.

7. **Agents / team roster**
   List of service-desk agents with avatar, role, status (online/away), and current open
   load (count + small capacity bar). Used by leads to assign intelligently; clicking an
   agent filters the queue to their tickets.
   *Acceptance:* load counts are derived from live assignments; roster is searchable;
   clicking "View queue" navigates to the queue filtered by that assignee.

8. **Persistence & seed**
   All data lives in the browser (localStorage via zustand) and survives reload. On
   first run the store seeds a realistic dataset. A "Reset demo data" action in settings
   restores the seed.
   *Acceptance:* mutations persist across reload; reset restores the full seed set;
   corrupt/empty storage falls back to the seed without crashing.

## SCREENS

- **Dashboard** (`/`) — KPI tiles (clickable → filtered queue), status bar chart,
  priority donut, SLA-health block, "My open tickets" list, recent activity feed.
  *Empty state:* if no tickets, an onboarding card with "Log your first ticket".
  *Loading:* skeleton tiles + chart placeholders.
- **Ticket Queue** (`/tickets`) — saved-view tabs, search + filter bar, dense sortable
  table with status/priority badges and SLA countdown, row quick-actions (assign to me,
  open), bulk-select toolbar. *Empty:* per-view empty states ("No unassigned tickets —
  nice, the queue's clear"). *Loading:* table-row skeletons. *Error:* inline retry.
- **Ticket Detail** (`/tickets/:id`) — header with ID, subject, status stepper, SLA
  chip; two-column body: left = description + activity timeline + composer, right =
  properties panel (status, priority, assignee, category, requester, dates). *Empty
  timeline:* guidance. *Not found:* friendly "Ticket INC-#### not found" with back link.
- **New Ticket** (`/tickets/new`) — validated form (subject, description, requester,
  category, priority, assignee), SLA preview, submit/cancel.
- **Agents** (`/agents`) — searchable roster grid/list with load bars and "View queue".
  *Empty search:* "No agents match."
- **Settings** (`/settings`) — profile placeholder, dark/light toggle, "Reset demo
  data", about. (Lightweight.)
- **App shell** — persistent left sidebar (logo, nav: Dashboard, Tickets, Agents,
  Settings; collapsible on mobile), top bar with global search, "New ticket" button,
  theme toggle, and current-agent menu.
- **Login** (`/login`) — template login route (see AUTH).

## DATA MODEL & STATE

PERSISTENCE: local — all data in browser localStorage via a zustand store
(`src/lib/store.ts`), seeded on first run. No backend, no network calls.

AUTH: login — the app is a private internal tool with a signed-in agent identity (the
"current agent" drives My Tickets, Assign to me, and note authorship). Builder builds the
template `/login` route. Roles are lightweight (agent vs lead) and not access-gated in
v1.

Entities (localStorage shapes; statuses/priorities as `as const` unions, never enums):

- **Ticket**: `id` (string, e.g. "INC-1042"), `subject` (string), `description`
  (string), `status` ("new" | "open" | "in_progress" | "on_hold" | "resolved" |
  "closed"), `priority` ("p1" | "p2" | "p3" | "p4"), `category` ("hardware" | "software"
  | "network" | "access" | "email" | "other"), `requesterId` (string),
  `assigneeId` (string | null), `channel` ("email" | "phone" | "portal" | "chat"),
  `createdAt` (ISO), `updatedAt` (ISO), `responseDueAt` (ISO), `resolutionDueAt` (ISO),
  `resolvedAt` (ISO | null), `resolutionNote` (string | null).
- **Activity** (belongs to a ticket): `id`, `ticketId`, `type` ("reply" | "note" |
  "system"), `authorId`, `body` (string), `createdAt` (ISO).
- **Agent**: `id`, `name`, `email`, `avatarUrl` (or initials), `role` ("agent" |
  "lead"), `presence` ("online" | "away" | "offline").
- **Requester**: `id`, `name`, `email`, `department` (string), `avatarUrl`/initials.
- **UI state** (zustand, not persisted as data): active saved-view, filters, search
  text, row selection, current-agent id, dialog open flags.

Derived (computed in render/selectors, not stored): SLA status per ticket
(on_track/warning/breached from `resolutionDueAt` vs now), per-agent open load,
dashboard KPIs and chart series, saved-view membership.

SLA rules: priority → resolution window map (P1 4h, P2 8h, P3 24h, P4 72h business-ish
hours simplified to real hours); warning threshold at 20% remaining; breached when now >
resolutionDueAt and not resolved.

Seed data (realistic, plentiful): **~28 tickets** spread across all statuses and
priorities with staggered created/updated/due times (some breaching, some warning, some
resolved today, some unassigned), **8 agents** (mix of leads/agents, varied presence and
load), **~14 requesters** across departments, and **60+ activity entries** (a believable
mix of replies, internal notes, and system events) so the timeline, queue, charts, and
roster all look genuinely alive. IDs, dates (date-fns formatting), and categories are
consistent and cross-referenced.

## COMPONENTS (shadcn/ui → screen)
- **Sidebar / navigation-menu / Sheet** — app shell + mobile nav.
- **Table** — ticket queue (with sortable headers, row selection Checkbox).
- **Badge** — status pills, priority pills, category tags, SLA chips.
- **Tabs** — saved views on the queue; sections on detail.
- **Card** — dashboard tiles, agent cards, detail panels (used sparingly, never nested).
- **Dialog / AlertDialog** — bulk actions confirm, reset-demo confirm, quick assign.
- **DropdownMenu** — row actions, assignee picker, current-agent menu.
- **Select** — status/priority/category/assignee/requester pickers, filters.
- **Input / Textarea / Label / Form** — new-ticket form, composer, search.
- **Avatar** — agents & requesters.
- **Progress** — agent capacity/load bars, SLA countdown bar.
- **Skeleton** — all loading states.
- **Tooltip** — SLA details, truncated cells, presence dots.
- **Sonner (toast)** — mutation feedback.
- **recharts** — dashboard bar (by status) + donut (by priority), using `var(--chart-1..5)`.

## DESIGN SYSTEM

**Color mode:** Dark. Scene: a service-desk agent works the ticket queue for a full
shift in an office under mixed screen/overhead light, scanning hundreds of rows and
relying on status color to triage fast — a calm dark surface reduces eye strain over
long sessions and makes priority/SLA color pop. This is an ops console, and dark is the
deliberate fit (light mode is provided via toggle).

**Color strategy:** Committed-restrained. Quiet, near-black brand-tinted chrome carries
most of the surface; a single mossy-green primary owns actions, selection, focus, and
"on-track"; a deliberate multi-hue semantic set carries ticket status, priority, and
SLA. Color is signal, never decoration.

**Brand hue:** green, seed `oklch(0.55 0.119 160)`. Primary composed at
`oklch(0.66 0.13 162)` (dark) / `oklch(0.55 0.12 162)` (light).

**Palette (dark, canonical):**
- background `oklch(0.17 0.006 165)`, foreground `oklch(0.94 0.006 160)`
- card/popover `oklch(0.21 0.007 165)` / `oklch(0.20 0.007 165)`
- sidebar `oklch(0.14 0.006 165)` (cooler/darker than content)
- primary `oklch(0.66 0.13 162)`, primary-foreground `oklch(0.16 0.02 162)`
- accent (slate-teal, links/secondary highlight) `oklch(0.66 0.09 210)`
- muted `oklch(0.24 0.007 165)`, muted-foreground `oklch(0.72 0.01 165)`
- border/input `oklch(0.28 0.008 165)`, ring = primary
- All neutrals carry ~0.006–0.008 chroma toward the green hue (165) for cohesion; no
  pure `#000`/`#fff`.

**Semantic colors → domain values:**
- SLA on-track / Resolved / success → green `chart-1` `oklch(0.66 0.13 162)`
- New / info → blue `chart-2` `oklch(0.66 0.13 245)`
- In Progress / SLA warning → amber `chart-3` `oklch(0.77 0.14 75)`
- Breached / P1 / error → red `destructive` `oklch(0.62 0.19 25)`
- On Hold → slate/muted neutral
- Priority: P1 red, P2 amber, P3 blue, P4 muted-neutral.
Charts use the full chart-1..5 multi-hue ramp (green, blue, amber, red, violet) — a
deliberate sequence, not tints of one hue.

**Contrast (WCAG AA):** foreground `0.94` on bg `0.17` ≫ 7:1; muted-foreground `0.72`
on bg ≥ 4.5:1; status/priority badges use a dark foreground on the light-ish fills and
white on the mid-saturated red/green fills so labels stay ≥4.5:1. Body text sits toward
the ink end — no faint gray on tinted near-black.

**Fonts:** Headings **Zilla Slab** (a dependable slab serif — technical, humane, gives
the console a spine). Body/UI **Hanken Grotesk** (clean humanist grotesque, excellent at
small dense sizes). Contrast axis = slab serif + grotesque sans (not two similar sans).
No mono display. Fixed rem type scale (~1.15–1.2 ratio) for dense product UI, not fluid.

**Layout:** Persistent left **sidebar** (collapses to a Sheet on mobile) + top bar with
global search / New ticket / theme toggle / agent menu. Dense tables, compact rows,
generous but rhythmic panel spacing. Two-column ticket detail (content + properties).
Dark mode is the default; light/dark swap via the `.dark` class token sets — never
per-component color overrides.

**Corner radius:** `0.25rem` — crisp and slightly angular, matching a precise,
data-dense ops tool; full-pill only on status/priority badges.

**Motion:** 150–220ms ease-out on status/hover/selection changes, sheet/dialog
transitions, and a subtle row-highlight when a ticket updates. Skeletons for loading.
List entrances may stagger subtly; respect `prefers-reduced-motion` with crossfade/
instant fallbacks. No decorative motion.

**Avoid:** cyan-on-dark cliché (primary is clearly green @162, not cyan), purple/blue
gradients, gradient text, glassmorphism, colored side-stripe borders, cream/beige
surfaces, pure black/white.

## NOTES
- Resolved ambiguities: primary user = agents; v1 scope = incident/ticket management
  only (service catalog, KB, CMDB, change management explicitly out of scope for v1, but
  the data model and nav leave room to grow). Persistence = local. AUTH = login with a
  simple "current agent" identity (no real access control in v1).
- "SLA business hours" simplified to real elapsed hours for a believable countdown
  without a full calendar engine.
- Vocabulary preserved: Ticket, Incident (INC-####), Requester, Agent, SLA, Priority
  (P1–P4), Status lifecycle — standard ITSM terms, not renamed.
- Non-goals v1: email ingestion, real notifications, multi-team routing, reporting
  export.
