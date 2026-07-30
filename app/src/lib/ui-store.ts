// Ephemeral UI state: theme, queue selection, and cross-navigation filter intent.
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TicketPriority, TicketStatus, TicketCategory } from '@/lib/types'

export const SAVED_VIEWS = [
  'all',
  'mine',
  'unassigned',
  'breaching',
  'resolved',
] as const
export type SavedView = (typeof SAVED_VIEWS)[number]

export const SAVED_VIEW_LABELS: Record<SavedView, string> = {
  all: 'All',
  mine: 'My Tickets',
  unassigned: 'Unassigned',
  breaching: 'Breaching',
  resolved: 'Resolved',
}

type Theme = 'dark' | 'light'

type ThemeState = {
  theme: Theme
  toggleTheme: () => void
  setTheme: (t: Theme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'service-desk-theme-v1' },
  ),
)

export type QueueFilters = {
  view: SavedView
  search: string
  status: TicketStatus | 'all'
  priority: TicketPriority | 'all'
  category: TicketCategory | 'all'
  assigneeId: string | 'all'
}

export const DEFAULT_FILTERS: QueueFilters = {
  view: 'all',
  search: '',
  status: 'all',
  priority: 'all',
  category: 'all',
  assigneeId: 'all',
}

type UiState = {
  filters: QueueFilters
  selectedIds: string[]
  setFilters: (patch: Partial<QueueFilters>) => void
  resetFilters: () => void
  applyDeepLink: (patch: Partial<QueueFilters>) => void
  toggleSelected: (id: string) => void
  setSelected: (ids: string[]) => void
  clearSelected: () => void
}

export const useUiStore = create<UiState>((set) => ({
  filters: DEFAULT_FILTERS,
  selectedIds: [],
  setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
  applyDeepLink: (patch) => set({ filters: { ...DEFAULT_FILTERS, ...patch }, selectedIds: [] }),
  toggleSelected: (id) =>
    set((s) => ({
      selectedIds: s.selectedIds.includes(id)
        ? s.selectedIds.filter((x) => x !== id)
        : [...s.selectedIds, id],
    })),
  setSelected: (ids) => set({ selectedIds: ids }),
  clearSelected: () => set({ selectedIds: [] }),
}))
