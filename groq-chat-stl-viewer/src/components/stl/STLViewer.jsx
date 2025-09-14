import { lazy, Suspense, useEffect, useId, useState } from 'react'
import { setActive, subscribe, getActive } from './activation'

const STLCanvas = lazy(() => import('./STLCanvas'))

export default function STLViewer({ source }) {
  const id = useId()
  const [active, setLocalActive] = useState(() => getActive() === id)

  useEffect(() => {
    return subscribe((cur) => setLocalActive(cur === id))
  }, [id])

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60">
      <div className="flex items-center justify-between px-3 py-2 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
        <div>
          3D Preview{source?.type === 'url' ? ` • ${source.url}` : ''}
        </div>
        <div className="flex items-center gap-2">
          {!active ? (
            <button
              type="button"
              onClick={() => setActive(id)}
              className="rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-2 py-1 text-[11px] hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Load
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActive(null)}
              className="rounded-md border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-2 py-1 text-[11px] hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Unload
            </button>
          )}
        </div>
      </div>
      {active && (
        <Suspense fallback={<div className="h-64 grid place-items-center text-slate-500">Loading 3D viewer…</div>}>
          <STLCanvas source={source} className="h-72" />
        </Suspense>
      )}
      {!active && (
        <div className="h-48 grid place-items-center text-slate-400 text-xs">Not loaded</div>
      )}
    </div>
  )
}
