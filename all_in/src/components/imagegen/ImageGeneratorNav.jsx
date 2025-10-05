import { NavLink } from 'react-router-dom'

function navClasses({ isActive }) {
  const base =
    'inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition border-slate-300 text-slate-700 hover:border-sky-500 hover:text-sky-600 dark:border-slate-700 dark:text-slate-200'
  const active = 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white border-transparent shadow'
  return `${base} ${isActive ? active : ''}`
}

export default function ImageGeneratorNav() {
  return (
    <nav className="flex flex-wrap items-center gap-2">
      <NavLink to="/imagegen" className={navClasses} end>
        Generator
      </NavLink>
      <NavLink to="/imagegen/gallery" className={navClasses}>
        Gallery
      </NavLink>
    </nav>
  )
}

