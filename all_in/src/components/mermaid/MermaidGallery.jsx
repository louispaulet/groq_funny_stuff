import MermaidGalleryItem from './MermaidGalleryItem'

import { MERMAID_HISTORY_LIMIT } from '../../lib/mermaidHistoryCookie'

export default function MermaidGallery({ history, onSelectHistory, onClearHistory }) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Mermaid gallery</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Each new render archives the previous diagram here. The gallery keeps up to {MERMAID_HISTORY_LIMIT} diagrams per browser.
          </p>
        </div>
        <button
          type="button"
          onClick={onClearHistory}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-red-400 hover:text-red-500 dark:border-slate-700 dark:text-slate-300 dark:hover:border-red-400 dark:hover:text-red-300"
        >
          Clear gallery cookie
        </button>
      </div>
      {history.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {history.map((entry) => (
            <MermaidGalleryItem key={`${entry.timestamp}-${entry.prompt}`} entry={entry} onSelect={onSelectHistory} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
          Generate a diagram to start building your Mermaid gallery. Every submission tucks the previous render here for safekeeping.
        </div>
      )}
    </section>
  )
}
