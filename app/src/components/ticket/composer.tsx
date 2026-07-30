// Composer for adding a public reply or an internal note to a ticket.
import { useState } from 'react'
import { Lock, MessageSquare, Send } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTicketMutations } from '@/data'
import { toast } from 'sonner'

type Mode = 'reply' | 'note'

export function Composer({ ticketId }: { ticketId: string }) {
  const { addActivity } = useTicketMutations()
  const [mode, setMode] = useState<Mode>('reply')
  const [body, setBody] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = body.trim()
    if (!text) return
    addActivity(ticketId, mode, text)
    toast.success(mode === 'note' ? 'Internal note added' : 'Reply posted')
    setBody('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'rounded-lg border p-3 transition-colors',
        mode === 'note'
          ? 'border-[color-mix(in_srgb,var(--chart-3),transparent_65%)] bg-[color-mix(in_srgb,var(--chart-3),transparent_94%)]'
          : 'border-border bg-card',
      )}
    >
      <div className="mb-2 inline-flex rounded-md border border-border bg-background p-0.5">
        <button
          type="button"
          onClick={() => setMode('reply')}
          className={cn(
            'inline-flex items-center gap-1.5 rounded px-3 py-1 text-sm font-medium transition-colors',
            mode === 'reply' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
          )}
        >
          <MessageSquare className="size-3.5" /> Public reply
        </button>
        <button
          type="button"
          onClick={() => setMode('note')}
          className={cn(
            'inline-flex items-center gap-1.5 rounded px-3 py-1 text-sm font-medium transition-colors',
            mode === 'note'
              ? 'bg-[var(--chart-3)] text-[oklch(0.2_0.03_75)]'
              : 'text-muted-foreground',
          )}
        >
          <Lock className="size-3.5" /> Internal note
        </button>
      </div>
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder={
          mode === 'note' ? 'Add an internal work note…' : 'Write a reply to the requester…'
        }
        aria-label={mode === 'note' ? 'Internal note' : 'Public reply'}
      />
      <div className="mt-2 flex justify-end">
        <Button type="submit" size="sm" disabled={!body.trim()}>
          <Send className="size-4" /> {mode === 'note' ? 'Add note' : 'Send reply'}
        </Button>
      </div>
    </form>
  )
}
