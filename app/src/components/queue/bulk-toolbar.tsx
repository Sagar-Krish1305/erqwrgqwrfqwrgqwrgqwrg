// Bulk-action toolbar shown when rows are selected: reassign or change status.
import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { TICKET_STATUSES } from '@/lib/types'
import type { TicketStatus } from '@/lib/types'
import { STATUS_LABELS } from '@/lib/domain'
import { useAgents, useTicketMutations } from '@/data'
import { useUiStore } from '@/lib/ui-store'
import { toast } from 'sonner'

export function BulkToolbar() {
  const selectedIds = useUiStore((s) => s.selectedIds)
  const clearSelected = useUiStore((s) => s.clearSelected)
  const agents = useAgents()
  const { bulkSetStatus, bulkSetAssignee } = useTicketMutations()

  const [pendingStatus, setPendingStatus] = useState<TicketStatus | null>(null)

  if (selectedIds.length === 0) return null
  const count = selectedIds.length

  function applyStatus(status: TicketStatus) {
    bulkSetStatus(selectedIds, status)
    toast.success(`${count} ticket${count > 1 ? 's' : ''} set to ${STATUS_LABELS[status]}`)
    clearSelected()
    setPendingStatus(null)
  }

  function applyAssignee(agentId: string) {
    bulkSetAssignee(selectedIds, agentId)
    const name = agents.find((a) => a.id === agentId)?.name ?? 'agent'
    toast.success(`${count} ticket${count > 1 ? 's' : ''} assigned to ${name}`)
    clearSelected()
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/40 bg-[color-mix(in_srgb,var(--primary),transparent_92%)] px-4 py-2.5">
      <span className="text-sm font-medium">{count} selected</span>

      <Select onValueChange={(v) => applyAssignee(v)}>
        <SelectTrigger className="h-8 w-[170px] bg-background" aria-label="Reassign selected">
          <SelectValue placeholder="Reassign to…" />
        </SelectTrigger>
        <SelectContent>
          {agents.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={(v) => setPendingStatus(v as TicketStatus)}>
        <SelectTrigger className="h-8 w-[160px] bg-background" aria-label="Change status of selected">
          <SelectValue placeholder="Set status…" />
        </SelectTrigger>
        <SelectContent>
          {TICKET_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="ghost" size="sm" className="ml-auto" onClick={clearSelected}>
        <X className="size-4" /> Clear
      </Button>

      <AlertDialog open={pendingStatus !== null} onOpenChange={(o) => !o && setPendingStatus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change status of {count} ticket{count > 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will set {count} selected ticket{count > 1 ? 's' : ''} to{' '}
              {pendingStatus ? STATUS_LABELS[pendingStatus] : ''} and log a system event on each.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => pendingStatus && applyStatus(pendingStatus)}>
              Apply
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
