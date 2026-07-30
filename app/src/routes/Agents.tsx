import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { PresenceDot } from '@/components/entity-bits'
import { agentInitials } from '@/lib/domain'
import { useAgentLoads } from '@/data'
import { useUiStore } from '@/lib/ui-store'

const CAPACITY = 8

export default function Agents() {
  const navigate = useNavigate()
  const agents = useAgentLoads()
  const applyDeepLink = useUiStore((s) => s.applyDeepLink)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return agents
    return agents.filter((a) => `${a.name} ${a.email} ${a.role}`.toLowerCase().includes(q))
  }, [agents, query])

  function viewQueue(agentId: string) {
    applyDeepLink({ view: 'all', assigneeId: agentId })
    navigate('/tickets')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team roster"
        description="Service-desk agents and their current open load."
      />

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search agents…"
          className="pl-9"
          aria-label="Search agents"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No agents match “{query}”.
        </div>
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
          {filtered.map((agent) => {
            const pct = Math.min((agent.openLoad / CAPACITY) * 100, 100)
            const over = agent.openLoad >= CAPACITY
            return (
              <div key={agent.id} className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-secondary text-sm font-semibold text-secondary-foreground">
                        {agentInitials(agent.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5">
                      <PresenceDot presence={agent.presence} />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{agent.name}</p>
                    <p className="truncate text-xs capitalize text-muted-foreground">
                      {agent.role} · {agent.presence}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Open load</span>
                    <span className="font-medium tabular-nums">
                      {agent.openLoad} / {CAPACITY}
                    </span>
                  </div>
                  <Progress
                    value={pct}
                    indicatorColor={over ? 'var(--destructive)' : 'var(--chart-1)'}
                  />
                </div>

                <Button variant="outline" size="sm" onClick={() => viewQueue(agent.id)}>
                  View queue
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
