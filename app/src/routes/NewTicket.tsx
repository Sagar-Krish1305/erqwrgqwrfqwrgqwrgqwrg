import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  SLA_HOURS,
  HOUR_MS,
} from '@/lib/domain'
import { TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_CHANNELS } from '@/lib/types'
import type { Ticket, TicketCategory, TicketChannel, TicketPriority } from '@/lib/types'
import { useAgents, useRequesters, useTicketMutations } from '@/data'
import { toast } from 'sonner'

const UNASSIGNED = 'unassigned'

export default function NewTicket() {
  const navigate = useNavigate()
  const requesters = useRequesters()
  const agents = useAgents()
  const { createTicket } = useTicketMutations()

  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [requesterId, setRequesterId] = useState('')
  const [category, setCategory] = useState<TicketCategory>('software')
  const [priority, setPriority] = useState<TicketPriority>('p3')
  const [assigneeId, setAssigneeId] = useState<string>(UNASSIGNED)
  const [channel, setChannel] = useState<TicketChannel>('portal')
  const [submitted, setSubmitted] = useState(false)

  const errors = {
    subject: subject.trim() ? '' : 'Subject is required.',
    description: description.trim() ? '' : 'Description is required.',
    requesterId: requesterId ? '' : 'Select a requester.',
  }
  const isValid = !errors.subject && !errors.description && !errors.requesterId

  const slaPreview = format(new Date(Date.now() + SLA_HOURS[priority] * HOUR_MS), 'MMM d, HH:mm')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (!isValid) return
    const ticket: Ticket = createTicket({
      subject: subject.trim(),
      description: description.trim(),
      requesterId,
      category,
      priority,
      assigneeId: assigneeId === UNASSIGNED ? null : assigneeId,
      channel,
    })
    toast.success(`${ticket.id} created`)
    navigate(`/tickets/${ticket.id}`)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Log a ticket" description="Record a new incident on a requester's behalf." />

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Short summary of the issue"
            aria-invalid={submitted && Boolean(errors.subject)}
          />
          {submitted && errors.subject && (
            <p className="text-xs text-destructive">{errors.subject}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="What happened, when it started, and any steps already tried…"
            aria-invalid={submitted && Boolean(errors.description)}
          />
          {submitted && errors.description && (
            <p className="text-xs text-destructive">{errors.description}</p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Requester</Label>
            <Select value={requesterId} onValueChange={setRequesterId}>
              <SelectTrigger aria-invalid={submitted && Boolean(errors.requesterId)}>
                <SelectValue placeholder="Select a requester" />
              </SelectTrigger>
              <SelectContent>
                {requesters.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name} · {r.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {submitted && errors.requesterId && (
              <p className="text-xs text-destructive">{errors.requesterId}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
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
          </div>

          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
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
          </div>

          <div className="space-y-1.5">
            <Label>Channel</Label>
            <Select value={channel} onValueChange={(v) => setChannel(v as TicketChannel)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TICKET_CHANNELS.map((c) => (
                  <SelectItem key={c} value={c} className="capitalize">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label>Initial assignee (optional)</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNASSIGNED}>Leave unassigned</SelectItem>
                {agents.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm">
          <span className="text-muted-foreground">Resolution SLA due: </span>
          <span className="font-medium">{slaPreview}</span>
          <span className="text-muted-foreground"> ({SLA_HOURS[priority]}h from now)</span>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => navigate('/tickets')}>
            Cancel
          </Button>
          <Button type="submit">Create ticket</Button>
        </div>
      </form>
    </div>
  )
}
