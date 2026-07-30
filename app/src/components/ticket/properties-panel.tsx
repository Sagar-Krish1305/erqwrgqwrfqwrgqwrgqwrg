// Right-hand properties panel: inline status / priority / assignee / category edits,
// plus requester and key dates. Resolving requires a resolution note.
import { useState } from 'react'
import { format } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AgentChip } from '@/components/entity-bits'
import { AssigneePicker } from '@/components/assignee-picker'
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  agentById,
  allowedTransitions,
} from '@/lib/domain'
import { TICKET_PRIORITIES, TICKET_CATEGORIES } from '@/lib/types'
import type { Ticket, TicketStatus } from '@/lib/types'
import { useAgents, useRequesters, useTicketMutations } from '@/data'
import { toast } from 'sonner'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

export function PropertiesPanel({ ticket }: { ticket: Ticket }) {
  const agents = useAgents()
  const requesters = useRequesters()
  const { setStatus, setAssignee, updateTicket } = useTicketMutations()

  const [resolveOpen, setResolveOpen] = useState(false)
  const [resolutionNote, setResolutionNote] = useState('')
  const [noteError, setNoteError] = useState(false)

  const assignee = agentById(agents, ticket.assigneeId)
  const requester = requesters.find((r) => r.id === ticket.requesterId)
  const transitions = allowedTransitions(ticket.status)

  function handleStatusChange(next: TicketStatus) {
    if (next === 'resolved') {
      setResolveOpen(true)
      return
    }
    setStatus(ticket.id, next)
    toast.success(`Status set to ${STATUS_LABELS[next]}`)
  }

  function confirmResolve() {
    if (resolutionNote.trim().length === 0) {
      setNoteError(true)
      return
    }
    setStatus(ticket.id, 'resolved', resolutionNote.trim())
    toast.success('Ticket resolved')
    setResolveOpen(false)
    setResolutionNote('')
    setNoteError(false)
  }

  return (
    <div className="space-y-5 rounded-lg border border-border bg-card p-5">
      <h2 className="font-heading text-base font-semibold">Properties</h2>

      <Field label="Status">
        <Select value={ticket.status} onValueChange={(v) => handleStatusChange(v as TicketStatus)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {transitions.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Priority">
        <Select
          value={ticket.priority}
          onValueChange={(v) => {
            updateTicket(
              ticket.id,
              { priority: v as Ticket['priority'] },
              `Priority changed to ${v.toUpperCase()}`,
            )
            toast.success('Priority updated')
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TICKET_PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Assignee">
        <AssigneePicker
          currentAssigneeId={ticket.assigneeId}
          onSelect={(id) => {
            setAssignee(ticket.id, id)
            toast.success('Assignee updated')
          }}
        >
          <button
            type="button"
            className="flex w-full items-center rounded-md border border-input bg-background px-3 py-2 text-left transition-colors hover:bg-muted"
          >
            <AgentChip agent={assignee} />
          </button>
        </AssigneePicker>
      </Field>

      <Field label="Category">
        <Select
          value={ticket.category}
          onValueChange={(v) => {
            updateTicket(
              ticket.id,
              { category: v as Ticket['category'] },
              `Category changed to ${CATEGORY_LABELS[v as Ticket['category']]}`,
            )
            toast.success('Category updated')
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TICKET_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <div className="space-y-3 border-t border-border pt-4 text-sm">
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Requester</span>
          <span className="text-right font-medium">{requester?.name ?? 'Unknown'}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Department</span>
          <span className="text-right">{requester?.department ?? '—'}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Channel</span>
          <span className="text-right capitalize">{ticket.channel}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Created</span>
          <span className="text-right">{format(new Date(ticket.createdAt), 'MMM d, HH:mm')}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Resolution due</span>
          <span className="text-right">
            {format(new Date(ticket.resolutionDueAt), 'MMM d, HH:mm')}
          </span>
        </div>
      </div>

      <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve ticket</DialogTitle>
            <DialogDescription>
              Add a resolution note describing how {ticket.id} was fixed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="resolution-note">Resolution note</Label>
            <Textarea
              id="resolution-note"
              value={resolutionNote}
              onChange={(e) => {
                setResolutionNote(e.target.value)
                if (e.target.value.trim()) setNoteError(false)
              }}
              placeholder="What was done to resolve this incident?"
              rows={4}
              aria-invalid={noteError}
            />
            {noteError && (
              <p className="text-xs text-destructive">A resolution note is required.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setResolveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmResolve}>Resolve ticket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
