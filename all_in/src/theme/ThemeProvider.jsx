import { useEffect, useMemo, useState } from 'react'
import { ThemeContext } from './ThemeContext'

function detectPreferredTheme() {
  if (typeof window === 'undefined') return 'light'
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored === 'light' || stored === 'dark') return stored
    } catch {
      // ignore storage access issues
    }
    return detectPreferredTheme()
  })

  useEffect(() => {
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // ignore storage write errors
    }
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [theme])

  const value = useMemo(() => ({ theme, setTheme }), [theme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
