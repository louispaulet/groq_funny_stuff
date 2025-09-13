import { lazy, Suspense } from 'react'

const STLCanvas = lazy(() => import('./STLCanvas'))

export default function STLViewer({ source }) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60">
      {source?.type === 'url' && (
        <div className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
          3D Preview • {source.url}
        </div>
      )}
      <Suspense fallback={<div className="h-64 grid place-items-center text-slate-500">Loading 3D viewer…</div>}>
        <STLCanvas source={source} className="h-72" />
      </Suspense>
    </div>
  )
}
