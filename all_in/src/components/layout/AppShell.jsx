import { NavLink } from 'react-router-dom'
import { MoonIcon, SunIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { experiences } from '../../config/experiences'
import { useTheme } from '../../theme'

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
      <span className="hidden sm:inline">{dark ? 'Light mode' : 'Dark mode'}</span>
    </button>
  )
}

function defaultNavClasses({ isActive }) {
  const base = 'inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900'
  const focus = 'focus-visible:ring-brand-500/40'
  if (isActive) {
    return `${base} border-transparent bg-brand-600 text-white shadow ${focus}`
  }
  return `${base} border-slate-300 bg-white/70 text-slate-600 hover:border-brand-500/60 hover:bg-brand-500/10 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:text-white ${focus}`
}

function experienceNavClasses(accent) {
  const gradient = accent?.gradient || 'from-brand-500 to-brand-600'
  const hover = accent?.hover || 'hover:bg-brand-500/10 hover:text-brand-600 hover:border-brand-400/60'
  const focus = accent?.focus || 'focus-visible:ring-brand-500/40'
  return ({ isActive }) => {
    const base = 'inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900'
    if (isActive) {
      return `${base} border-transparent bg-gradient-to-r ${gradient} text-white shadow ${focus}`
    }
    return `${base} border-slate-300 bg-white/70 text-slate-600 ${hover} dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:text-white ${focus}`
  }
}

function footerLinkClasses({ isActive }) {
  const base = 'inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-brand-500 hover:text-brand-600 dark:border-slate-600 dark:text-slate-300'
  const active = 'bg-brand-600 text-white border-brand-600 shadow-sm'
  return `${base} ${isActive ? active : ''}`
}

function profileNavClasses({ isActive }) {
  const base = 'inline-flex h-11 w-11 items-center justify-center rounded-full border text-slate-600 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-slate-200 dark:focus-visible:ring-offset-slate-900'
  if (isActive) {
    return `${base} border-brand-500 bg-brand-600 text-white shadow`
  }
  return `${base} border-slate-300 bg-white/80 hover:border-brand-500/60 hover:bg-brand-500/10 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-800/70`
}

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex w-full items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
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
            <NavLink to="/" className={defaultNavClasses} end>
              Overview
            </NavLink>
            {experiences
              .filter(
                experience =>
                  experience.id !== 'objectmaker' &&
                  experience.id !== 'stlviewer' &&
                  experience.id !== 'sixdegrees' &&
                  experience.id !== 'imagegen' &&
                  experience.id !== 'svglab' &&
                  experience.id !== 'flagfoundry' &&
                  experience.id !== 'pizzamaker' &&
                  experience.id !== 'carmaker',
              )
              .map((experience) => (
              <NavLink
                key={experience.id}
                to={experience.path}
                className={experienceNavClasses(experience.navAccent)}
              >
                {experience.name}
              </NavLink>
            ))}
            <NavLink to="/about" className={defaultNavClasses}>About</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <NavLink to="/profile" className={profileNavClasses} title="Profile options">
              <UserCircleIcon className="h-5 w-5" />
              <span className="sr-only">Profile options</span>
            </NavLink>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="w-full flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="mt-auto border-t border-slate-200 bg-white/80 py-6 text-sm text-slate-600 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
        <div className="flex w-full flex-col gap-2 px-4 text-center sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:justify-start">
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:justify-start">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Groq AllIn Studio</span>
              <span className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Unified Workspace ⚙️</span>
            </div>
            <NavLink to="/" className={footerLinkClasses} end>Overview</NavLink>
            <NavLink to="/about" className={footerLinkClasses}>About</NavLink>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Fast chats powered by Groq’s API · Built with React, Vite, and Tailwind CSS ⚡️
          </div>
        </div>
      </footer>
    </div>
  )
}
