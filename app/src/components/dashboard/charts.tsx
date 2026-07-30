// Dashboard charts — tickets by status (bar) and open tickets by priority (donut).
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DashboardData } from '@/data'

const STATUS_COLOR = 'var(--chart-1)'
const PRIORITY_COLORS = ['var(--destructive)', 'var(--chart-3)', 'var(--chart-2)', 'var(--muted-foreground)']

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="mb-4 font-heading text-base font-semibold">{title}</h2>
      {children}
    </div>
  )
}

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '0.5rem',
  color: 'var(--popover-foreground)',
  fontSize: '0.8rem',
}

export function StatusBarChart({ data }: { data: DashboardData }) {
  return (
    <ChartCard title="Tickets by status">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data.byStatus} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip cursor={{ fill: 'var(--muted)', opacity: 0.4 }} contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey="count" fill={STATUS_COLOR} radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function PriorityDonut({ data }: { data: DashboardData }) {
  const series = data.byPriority.filter((d) => d.count > 0)
  return (
    <ChartCard title="Open by priority">
      {series.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">No open tickets.</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={series}
              dataKey="count"
              nameKey="label"
              innerRadius={54}
              outerRadius={84}
              paddingAngle={2}
              stroke="var(--card)"
            >
              {series.map((entry) => {
                const idx = data.byPriority.findIndex((p) => p.key === entry.key)
                return <Cell key={entry.key} fill={PRIORITY_COLORS[idx] ?? 'var(--chart-5)'} />
              })}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
      )}
      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {data.byPriority.map((d, idx) => (
          <span key={d.key} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: PRIORITY_COLORS[idx] ?? 'var(--chart-5)' }}
            />
            {d.label} · {d.count}
          </span>
        ))}
      </div>
    </ChartCard>
  )
}
