import { lazy, Suspense, useEffect, useId, useState } from 'react'
import { setActive, subscribe, getActive } from './activation'

const STLCanvas = lazy(() => import('./STLCanvas'))

export default function STLViewer({ source }) {
  const id = useId()
  const [active, setLocalActive] = useState(() => getActive() === id)

  useEffect(() => {
    return subscribe((current) => setLocalActive(current === id))
  }, [id])

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white/60 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
        <div>3D Preview{source?.type === 'url' ? ` • ${source.url}` : ''}</div>
        <div className="flex items-center gap-2">
          {!active ? (
            <button
              type="button"
              onClick={() => setActive(id)}
              className="rounded-md border border-slate-300 bg-white/80 px-2 py-1 text-[11px] text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Load
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActive(null)}
              className="rounded-md border border-slate-300 bg-white/80 px-2 py-1 text-[11px] text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Unload
            </button>
          )}
        </div>
      </div>
      {active && (
        <Suspense fallback={<div className="h-64 grid place-items-center text-slate-500">Loading 3D viewer...</div>}>
          <STLCanvas source={source} className="h-72" />
        </Suspense>
      )}
      {!active && (
        <div className="h-48 grid place-items-center text-xs text-slate-400">Not loaded</div>
      )}
    </div>
  )
}
