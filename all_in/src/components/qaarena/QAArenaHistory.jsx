import clsx from 'clsx'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { QA_ARENA_CATEGORIES } from '../../content/qaarenaTopics'

function HistoryBadge({ categoryId }) {
  const meta = QA_ARENA_CATEGORIES[categoryId]
  if (!meta) return null
  return (
    <span className={clsx('inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest shadow-sm', meta.badgeColor)}>
      {meta.label}
    </span>
  )
}

export function QAArenaHistory({ history, models, isOpen, onToggle, isHighlighting }) {
  const entries = history || []
  const modelAInfo = models?.modelA || {}
  const modelBInfo = models?.modelB || {}
  const modelALabel = modelAInfo.badgeLabel || modelAInfo.shortName || 'Model A'
  const modelBLabel = modelBInfo.badgeLabel || modelBInfo.shortName || 'Model B'
  const modelATitle = modelAInfo.display || modelAInfo.id || modelALabel
  const modelBTitle = modelBInfo.display || modelBInfo.id || modelBLabel
  const totalTracked = `${entries.length}/5`

  return (
    <section
      className={clsx(
        'relative overflow-hidden rounded-3xl border border-slate-900/10 bg-white/95 p-6 text-slate-900 shadow-md shadow-slate-900/15 transition dark:border-slate-700/60 dark:bg-slate-900/75 dark:text-slate-100',
        isHighlighting ? 'ring-2 ring-sky-400/50 shadow-sky-200/60 dark:ring-sky-500/60' : 'ring-0',
      )}
    >
      <div className="absolute -top-28 left-10 h-48 w-48 rounded-full bg-sky-400/10 blur-3xl dark:bg-sky-500/20" aria-hidden="true" />
      <div className="absolute -bottom-24 right-6 h-56 w-56 rounded-full bg-purple-400/10 blur-3xl dark:bg-purple-500/20" aria-hidden="true" />
      <div className="relative">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 rounded-2xl border border-transparent bg-transparent px-0 py-1 text-left transition hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:hover:text-sky-300 dark:focus-visible:ring-sky-500 dark:focus-visible:ring-offset-slate-900"
        >
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3 items-center justify-center">
              <span className={clsx('h-3 w-3 rounded-full transition', isHighlighting ? 'bg-sky-500 opacity-100' : 'bg-slate-400 opacity-60')} />
              {isHighlighting ? <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-sky-300 opacity-75" /> : null}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-500 dark:text-slate-400">Past Moves</p>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Match Timeline</h2>
            </div>
          </div>
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
            {totalTracked}
            {isOpen ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
          </span>
        </button>

        <div className="mt-4">
          {isOpen ? (
            entries.length === 0 ? (
              <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-700/60 dark:bg-slate-800/40 dark:text-slate-300">
                <span className="text-base font-semibold text-slate-600 dark:text-slate-100">No duels recorded</span>
                <span className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500">Run a match to start building the timeline.</span>
              </div>
            ) : (
              <ol className="grid max-h-[420px] gap-4 overflow-y-auto pr-1">
                {entries.map((item) => (
                  <li
                    key={item.id}
                    className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 p-4 text-sm text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-200"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200/25 to-transparent opacity-0 transition group-hover:opacity-100 dark:via-slate-600/30" aria-hidden="true" />
                    <div className="relative flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-col gap-2">
                        <HistoryBadge categoryId={item.categoryId} />
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">{item.theme}</p>
                      </div>
                      <time className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </time>
                    </div>
                    <div className="relative mt-3 space-y-2 text-sm">
                      <p className="text-base font-semibold text-slate-900 dark:text-white">{item.question}</p>
                      <div className="grid gap-2">
                        <div className="flex items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 text-sky-800 dark:border-sky-400/50 dark:bg-sky-500/15 dark:text-sky-100">
                          <span className="text-xs font-semibold uppercase tracking-widest text-sky-600/80 dark:text-sky-200/80" title={modelATitle}>
                            {modelALabel}
                          </span>
                          <span className="text-sm font-semibold">{item.answers?.modelA ?? '—'}</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-800 dark:border-rose-400/50 dark:bg-rose-500/15 dark:text-rose-100">
                          <span className="text-xs font-semibold uppercase tracking-widest text-rose-600/80 dark:text-rose-200/80" title={modelBTitle}>
                            {modelBLabel}
                          </span>
                          <span className="text-sm font-semibold">{item.answers?.modelB ?? '—'}</span>
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:border-emerald-400/60 dark:bg-emerald-500/15 dark:text-emerald-100">
                        Correct Answer · {item.correctAnswer}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )
          ) : (
            <div className="flex min-h-[120px] flex-col justify-center rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-300">
              Timeline collapsed. Expand to review the last plays.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
