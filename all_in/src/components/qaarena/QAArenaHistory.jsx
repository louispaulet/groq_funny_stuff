import clsx from 'clsx'
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

export function QAArenaHistory({ history, models }) {
  const entries = history || []
  const modelAInfo = models?.modelA || {}
  const modelBInfo = models?.modelB || {}
  const modelALabel = modelAInfo.badgeLabel || modelAInfo.shortName || 'Model A'
  const modelBLabel = modelBInfo.badgeLabel || modelBInfo.shortName || 'Model B'
  const modelATitle = modelAInfo.display || modelAInfo.id || modelALabel
  const modelBTitle = modelBInfo.display || modelBInfo.id || modelBLabel
  return (
    <section className="space-y-4 rounded-3xl border border-slate-200/20 bg-slate-900/40 p-6 text-white shadow-lg backdrop-blur-xl dark:border-slate-700/40">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-slate-500">Recent Battles</p>
          <h2 className="text-2xl font-black text-white">Last Five Questions</h2>
        </div>
        <span className="rounded-full border border-slate-700/40 bg-slate-900/70 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-300">
          {entries.length}/5 tracked
        </span>
      </header>
      {entries.length === 0 ? (
        <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-600/60 bg-slate-900/20 text-center text-sm text-slate-300">
          <span className="text-base font-semibold text-slate-100">No duels recorded</span>
          <span className="text-xs uppercase tracking-widest text-slate-500">Launch an arena run to start the timeline.</span>
        </div>
      ) : (
        <ol className="space-y-4">
          {entries.map((item) => (
            <li
              key={item.id}
              className="group relative overflow-hidden rounded-3xl border border-slate-200/20 bg-gradient-to-r from-slate-900 via-slate-900/70 to-slate-800/80 p-4 shadow-inner"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <HistoryBadge categoryId={item.categoryId} />
                  <p className="text-sm text-slate-300">{item.theme}</p>
                </div>
                <time className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </time>
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-200">
                <p className="text-base font-semibold text-white">{item.question}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="flex items-center gap-2 rounded-2xl border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-sky-100">
                    <span className="text-xs font-semibold uppercase tracking-widest text-sky-200/80" title={modelATitle}>
                      {modelALabel}
                    </span>
                    <span className="text-sm font-semibold">{item.answers?.modelA ?? '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-rose-100">
                    <span className="text-xs font-semibold uppercase tracking-widest text-rose-200/80" title={modelBTitle}>
                      {modelBLabel}
                    </span>
                    <span className="text-sm font-semibold">{item.answers?.modelB ?? '—'}</span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-100">
                  Correct Answer · {item.correctAnswer}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
