import { NavLink } from 'react-router-dom'
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { experiences } from '../../config/experiences'
import { useTheme } from '../../theme/ThemeContext'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100"
      title="Toggle theme"
    >
      {dark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
      <span className="hidden sm:inline">{dark ? 'Light mode' : 'Dark mode'}</span>
    </button>
  )
}

function navClasses({ isActive }) {
  const base = 'inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors'
  const active = 'bg-brand-600 text-white shadow'
  const inactive = 'text-slate-600 hover:bg-white/70 hover:text-brand-600 dark:text-slate-300 dark:hover:text-white'
  return `${base} ${isActive ? active : inactive}`
}

function footerLinkClasses({ isActive }) {
  const base = 'inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-brand-500 hover:text-brand-600 dark:border-slate-600 dark:text-slate-300'
  const active = 'bg-brand-600 text-white border-brand-600 shadow-sm'
  return `${base} ${isActive ? active : ''}`
}

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white text-lg font-semibold">
              llI
            </div>
            <div className="leading-tight">
              <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Groq</div>
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">AllIn Studio</div>
            </div>
          </NavLink>
          <nav className="hidden items-center gap-2 md:flex">
            <NavLink to="/" className={navClasses} end>
              Overview
            </NavLink>
            {experiences.map((experience) => (
              <NavLink
                key={experience.id}
                to={experience.path}
                className={navClasses}
              >
                {experience.name}
              </NavLink>
            ))}
            <NavLink to="/about" className={navClasses}>About</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
      <footer className="mt-auto border-t border-slate-200 bg-white/80 py-6 text-sm text-slate-600 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="space-y-2">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-200">Groq AllIn Studio</span>
              <span className="ml-2 text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Unified Playground</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:justify-start">
              <NavLink to="/" className={footerLinkClasses} end>Overview</NavLink>
              <NavLink to="/about" className={footerLinkClasses}>About</NavLink>
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Fast chats powered by Groq’s API · Built with React, Vite, and Tailwind CSS
          </div>
        </div>
      </footer>
    </div>
  )
}
