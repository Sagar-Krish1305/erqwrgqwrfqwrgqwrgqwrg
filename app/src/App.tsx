import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from '@/routes/Login'
import ForgotPassword from '@/routes/ForgotPassword'
import UpdatePassword from '@/routes/UpdatePassword'
import Dashboard from '@/routes/Dashboard'
import Tickets from '@/routes/Tickets'
import TicketDetail from '@/routes/TicketDetail'
import NewTicket from '@/routes/NewTicket'
import Agents from '@/routes/Agents'
import Settings from '@/routes/Settings'
import { AppShell } from '@/components/app-shell'
import { ThemeSync } from '@/components/theme-sync'

// BrowserRouter (clean URLs, no #). The mount path is never hardcoded here — the engine
// bakes it in as Vite's `base` (VITE_APP_BASE, see vite.config.ts) and the app reads it
// back as BASE_URL, so one value covers every slot it serves. A deploy build bakes '/'
// (the app's domain root → basename normalizes to undefined = root); a preview slot bakes
// its /agent-api/… path. The trailing slash goes because react-router rejects '/a/b'
// against basename '/a/b/'.
const APP_BASE = import.meta.env.BASE_URL
const basename = (APP_BASE.startsWith('/') ? APP_BASE.replace(/\/+$/, '') : '') || undefined

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <ThemeSync />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route
          path="/"
          element={
            <AppShell>
              <Dashboard />
            </AppShell>
          }
        />
        <Route
          path="/tickets"
          element={
            <AppShell>
              <Tickets />
            </AppShell>
          }
        />
        <Route
          path="/tickets/new"
          element={
            <AppShell>
              <NewTicket />
            </AppShell>
          }
        />
        <Route
          path="/tickets/:id"
          element={
            <AppShell>
              <TicketDetail />
            </AppShell>
          }
        />
        <Route
          path="/agents"
          element={
            <AppShell>
              <Agents />
            </AppShell>
          }
        />
        <Route
          path="/settings"
          element={
            <AppShell>
              <Settings />
            </AppShell>
          }
        />
        <Route
          path="*"
          element={
            <AppShell>
              <div className="mx-auto max-w-md py-20 text-center">
                <h1 className="font-heading text-2xl font-semibold">Page not found</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  The page you’re looking for doesn’t exist.
                </p>
              </div>
            </AppShell>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
