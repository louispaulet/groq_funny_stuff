import ModelSelector from './ModelSelector'
import { useTheme } from '../theme/ThemeContext'
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'

export default function Header({ model, onModelChange }) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand-600 text-white grid place-items-center font-semibold">G</div>
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Groq Chat</div>
            <div className="text-base font-semibold text-slate-800 dark:text-slate-100">3D STL Preview</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/60 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Toggle theme"
          >
            {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            <span className="hidden md:inline">{isDark ? 'Light' : 'Dark'}</span>
          </button>
          <ModelSelector value={model} onChange={onModelChange} />
        </div>
      </div>
    </header>
  )
}
