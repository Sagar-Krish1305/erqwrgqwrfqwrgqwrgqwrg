import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from '@/routes/Login'
import ForgotPassword from '@/routes/ForgotPassword'
import UpdatePassword from '@/routes/UpdatePassword'
import Calculator from '@/routes/Calculator'

// BrowserRouter (clean URLs, no #). The mount path is never hardcoded here — the engine
// bakes it in as Vite's `base` (VITE_APP_BASE, see vite.config.ts) and the app reads it
// back as BASE_URL, so one value covers every slot it serves. A deploy build bakes '/'
// (the app's domain root → basename normalizes to undefined = root); a preview slot bakes
// its /agent-api/… path. The trailing slash goes because react-router rejects '/a/b'
// against basename '/a/b/'.
const APP_BASE = import.meta.env.BASE_URL
const basename = (APP_BASE.startsWith('/') ? APP_BASE.replace(/\/+$/, '') : '') || undefined

export default function App() {
  // Calc uses the theme's dark palette by default (matches theme.json mode: dark).
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/" element={<Calculator />} />
        <Route path="*" element={<Calculator />} />
      </Routes>
    </BrowserRouter>
  )
}
