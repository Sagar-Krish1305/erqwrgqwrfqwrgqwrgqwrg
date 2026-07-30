# Service Desk — Product Brief

## Register
product

## What it is
Service Desk is an IT service-management (ITSM) workspace built for the people who
actually work tickets: service-desk agents and support staff. It centers on incident
and ticket management — a live queue, a focused ticket workspace, assignment and
triage, status/priority workflow, SLA awareness, and the daily metrics an agent and a
team lead glance at. It is a single-team internal tool, not an end-user self-service
portal.

## Who it's for
- **Service-desk agents** — live in the queue, pick up and work tickets, log activity,
  change status, resolve.
- **Team leads / dispatchers** — triage the unassigned queue, balance load across
  agents, watch SLA breaches, read the dashboard.

## Core screens
1. **Dashboard** — the shift overview: open/unassigned/breaching counts, tickets by
   status and priority, SLA health, personal "my queue", recent activity.
2. **Ticket Queue** — the workhorse: filterable, sortable table of every incident with
   status, priority, assignee, SLA countdown, and quick actions. Saved views (All / My
   Tickets / Unassigned / Breaching).
3. **Ticket Detail** — the workspace for one ticket: full description, properties panel
   (status, priority, assignee, category, requester), SLA timer, and a chronological
   activity timeline with a comment/work-note composer.
4. **New Ticket** — log an incident on a requester's behalf.
5. **Agents / Team** — roster of agents with current load for smart assignment.

## Tone / identity
Methodical, dependable, plainspoken. Feels like a professional ops console — quiet
chrome, loud status. Slab-serif headings over a clean grotesque body give it a
technical-but-humane voice. No marketing gloss; every pixel earns its place in the
agent's flow.

## Notes
- Full spec (features, screens, data model, components, design system) lives in
  **`PLAN.md`** at the workspace root — the source of truth for what to build.
- Do not stop to "initialize project context" — it is already set up here.
- Never scaffold, install dependencies, or run a dev server; the platform owns the
  build and preview.
