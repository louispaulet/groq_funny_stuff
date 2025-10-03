import { NavLink } from 'react-router-dom'

const NAV_LINK_CLASSES =
  'inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'

export default function AllergyFinderNav() {
  return (
    <nav aria-label="AllergyFinder sections" className="flex flex-wrap items-center gap-2">
      <NavLink
        to="/allergyfinder"
        end
        className={({ isActive }) =>
          `${NAV_LINK_CLASSES} ${
            isActive
              ? 'bg-emerald-600 text-white focus-visible:outline-emerald-400'
              : 'border border-transparent bg-white/80 text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50 focus-visible:outline-emerald-300 dark:bg-slate-900/60 dark:text-emerald-200 dark:hover:bg-emerald-900/40'
          }`
        }
      >
        Chat Assistant
      </NavLink>
      <NavLink
        to="/allergyfinder/cookies"
        className={({ isActive }) =>
          `${NAV_LINK_CLASSES} ${
            isActive
              ? 'bg-emerald-600 text-white focus-visible:outline-emerald-400'
              : 'border border-transparent bg-white/80 text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50 focus-visible:outline-emerald-300 dark:bg-slate-900/60 dark:text-emerald-200 dark:hover:bg-emerald-900/40'
          }`
        }
      >
        Allergy Cookie Editor
      </NavLink>
    </nav>
  )
}
