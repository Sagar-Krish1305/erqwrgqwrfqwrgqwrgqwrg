import { Moon, RotateCcw, Sun } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { agentInitials } from '@/lib/domain'
import { useThemeStore } from '@/lib/ui-store'
import { useUiStore } from '@/lib/ui-store'
import { useCurrentAgent, useResetDemoData } from '@/data'
import { toast } from 'sonner'

function SettingRow({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="space-y-0.5">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  )
}

export default function Settings() {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const resetDemoData = useResetDemoData()
  const resetFilters = useUiStore((s) => s.resetFilters)
  const clearSelected = useUiStore((s) => s.clearSelected)
  const agent = useCurrentAgent()

  function handleReset() {
    resetDemoData()
    resetFilters()
    clearSelected()
    toast.success('Demo data restored')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Settings" description="Preferences for this workspace." />

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-1 font-heading text-base font-semibold">Profile</h2>
        {agent && (
          <div className="flex items-center gap-3 pt-2">
            <Avatar className="size-10">
              <AvatarFallback className="bg-primary/15 font-semibold text-primary">
                {agentInitials(agent.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{agent.name}</p>
              <p className="text-sm capitalize text-muted-foreground">
                {agent.role} · {agent.email}
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-border bg-card px-5 divide-y divide-border">
        <SettingRow title="Appearance" description="Switch between dark and light themes.">
          <div className="flex items-center gap-2">
            <Sun className="size-4 text-muted-foreground" />
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')}
              aria-label="Toggle dark mode"
            />
            <Moon className="size-4 text-muted-foreground" />
            <Label className="sr-only">Dark mode</Label>
          </div>
        </SettingRow>

        <SettingRow
          title="Reset demo data"
          description="Restore the seeded tickets, agents, and activity."
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <RotateCcw className="size-4" /> Reset
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset demo data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This replaces all current tickets and activity with the original seed set.
                  This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset}>Reset data</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SettingRow>
      </section>

      <section className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
        <h2 className="mb-1 font-heading text-base font-semibold text-foreground">About</h2>
        <p>
          Service Desk is an ITSM incident-management workspace. Data is stored locally in your
          browser and persists across reloads.
        </p>
      </section>
    </div>
  )
}
