import { NavLink } from 'react-router-dom'

function navClasses({ isActive }) {
  const base =
    'inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition border-slate-300 text-slate-700 hover:border-amber-500 hover:text-amber-600 dark:border-slate-700 dark:text-slate-200'
  const active = 'bg-gradient-to-r from-yellow-400 to-amber-600 text-white border-transparent shadow'
  return `${base} ${isActive ? active : ''}`
}

export default function ObjectMakerNav() {
  return (
    <nav className="flex flex-wrap items-center gap-2">
      <NavLink to="/objectmaker" className={navClasses} end>
        Builder
      </NavLink>
      <NavLink to="/objectmaker/zoo" className={navClasses}>
        Zoo
      </NavLink>
    </nav>
  )
}

