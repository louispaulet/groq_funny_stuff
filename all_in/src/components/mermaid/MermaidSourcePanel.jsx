import { ClipboardDocumentIcon } from '@heroicons/react/24/outline'

export default function MermaidSourcePanel({ mermaidSource, diagramTitle, diagramNotes, copied, onCopy }) {
  if (!mermaidSource) {
    return null
  }

  return (
    <section className="space-y-3 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Generated Mermaid source</h2>
          {diagramTitle ? <p className="text-sm text-slate-500 dark:text-slate-400">{diagramTitle}</p> : null}
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-brand-300 dark:hover:text-brand-200"
        >
          <ClipboardDocumentIcon className="h-4 w-4" />
          <span>{copied ? 'Copied!' : 'Copy source'}</span>
        </button>
      </div>
      <textarea
        value={mermaidSource}
        readOnly
        spellCheck={false}
        className="h-48 w-full rounded-2xl border border-slate-300 bg-slate-950/5 px-4 py-3 text-xs font-mono text-slate-700 shadow-inner transition dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
      />
      {diagramNotes ? <p className="text-sm text-slate-500 dark:text-slate-400">{diagramNotes}</p> : null}
    </section>
  )
}
