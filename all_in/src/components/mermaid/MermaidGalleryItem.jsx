import { useMemo } from 'react'

import { buildPreviewMarkup } from '../../lib/mermaidStudio'

export default function MermaidGalleryItem({ entry, onSelect }) {
  const sanitizedMarkup = useMemo(() => buildPreviewMarkup(entry.svgMarkup), [entry.svgMarkup])
  const title = entry.title || 'Saved Mermaid diagram'
  const brief = entry.prompt

  return (
    <button
      type="button"
      onClick={() => onSelect(entry)}
      className="group flex flex-col gap-2 overflow-hidden rounded-xl border border-slate-200 bg-white/80 p-3 text-left shadow-sm transition hover:border-brand-400 hover:bg-brand-50/70 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-brand-300"
    >
      <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
        {sanitizedMarkup ? (
          <div
            className="h-full w-full origin-top-left scale-90 transform text-slate-900 dark:text-slate-100"
            dangerouslySetInnerHTML={{ __html: sanitizedMarkup }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400 dark:text-slate-500">
            Preview unavailable
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="line-clamp-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
        {brief ? <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">“{brief}”</p> : null}
        {entry.timestamp ? (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {new Date(entry.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        ) : null}
      </div>
    </button>
  )
}
