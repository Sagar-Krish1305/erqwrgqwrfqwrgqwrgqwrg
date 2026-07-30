// Applies the persisted theme to <html> as the `.dark` class. External DOM system,
// so useEffect is correct here.
import { useEffect } from 'react'
import { useThemeStore } from '@/lib/ui-store'

export function ThemeSync() {
  const theme = useThemeStore((s) => s.theme)
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
  }, [theme])
  return null
}
