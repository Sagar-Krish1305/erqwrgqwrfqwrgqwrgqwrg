// Reusable assignee dropdown — "Assign to me", clear, or pick any agent.
import { Check, UserRound } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { agentInitials } from '@/lib/domain'
import { useAgents, useCurrentAgentId } from '@/data'

export function AssigneePicker({
  currentAssigneeId,
  onSelect,
  children,
}: {
  currentAssigneeId: string | null
  onSelect: (agentId: string | null) => void
  children: React.ReactNode
}) {
  const agents = useAgents()
  const currentAgentId = useCurrentAgentId()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Assign to</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onSelect(currentAgentId)}>
          <UserRound className="size-4" /> Assign to me
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSelect(null)}>Unassign</DropdownMenuItem>
        <DropdownMenuSeparator />
        {agents.map((a) => (
          <DropdownMenuItem key={a.id} onClick={() => onSelect(a.id)}>
            <span className="flex size-5 items-center justify-center rounded-full bg-secondary text-[0.6rem] font-semibold text-secondary-foreground">
              {agentInitials(a.name)}
            </span>
            <span className="flex-1">{a.name}</span>
            {currentAssigneeId === a.id && <Check className="size-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
