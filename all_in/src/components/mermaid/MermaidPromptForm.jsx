import { ArrowPathIcon, PlayIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'

function statusClasses(type) {
  if (type === 'error') {
    return 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200'
  }
  if (type === 'success') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200'
  }
  return 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200'
}

export default function MermaidPromptForm({
  prompt,
  promptPlaceholder,
  rendering,
  model,
  status,
  onPromptChange,
  onSubmit,
  onClear,
  onDismissStatus,
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:p-8">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label htmlFor="mermaid-prompt" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Describe the diagram you need
          </label>
          <textarea
            id="mermaid-prompt"
            value={prompt}
            onChange={(event) => onPromptChange(event.target.value)}
            placeholder={promptPlaceholder}
            rows={4}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            disabled={rendering}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            We send your brief to the <code className="rounded bg-slate-900/80 px-1 py-0.5 text-[0.7rem] text-white">/obj</code>{' '}
            helper so the LLM returns a ready-to-render Mermaid definition.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-brand-400"
            disabled={rendering}
          >
            {rendering ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <PlayIcon className="h-4 w-4" />}
            <span>{rendering ? 'Drafting…' : 'Generate diagram'}</span>
          </button>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-400 hover:text-red-500 dark:border-slate-700 dark:text-slate-200 dark:hover:border-red-400 dark:hover:text-red-300"
          >
            <TrashIcon className="h-4 w-4" />
            <span>Clear</span>
          </button>
          {model ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600 dark:border-brand-500/50 dark:bg-brand-900/10 dark:text-brand-200">
              Using {model}
            </span>
          ) : null}
        </div>
      </form>
      {status ? (
        <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-medium transition ${statusClasses(status.type)}`}>
          <div className="flex items-start justify-between gap-4">
            <p className="whitespace-pre-wrap text-left text-sm font-medium">{status.message}</p>
            {onDismissStatus ? (
              <button
                type="button"
                onClick={onDismissStatus}
                className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border border-slate-300 text-slate-500 transition hover:border-slate-400 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40 dark:border-slate-600 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-100"
                aria-label="Dismiss status"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}
