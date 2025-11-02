import clsx from 'clsx'
import { QA_ARENA_CATEGORIES } from '../../content/qaarenaTopics'

const MODEL_STYLES = {
  modelA: {
    shortName: 'Model A',
    tone: 'text-sky-600 dark:text-sky-300',
    accentText: 'text-sky-500 dark:text-sky-200',
    dot: 'bg-sky-500',
    shadow: 'shadow-[0_18px_45px_-30px_rgba(56,189,248,0.85)]',
  },
  modelB: {
    shortName: 'Model B',
    tone: 'text-rose-600 dark:text-rose-300',
    accentText: 'text-rose-500 dark:text-rose-200',
    dot: 'bg-rose-500',
    shadow: 'shadow-[0_18px_45px_-30px_rgba(244,114,182,0.85)]',
  },
}

function ScorePill({ modelKey, value, models }) {
  const style = MODEL_STYLES[modelKey] || {}
  const info = models?.[modelKey] || {}
  const shortName = info.shortName || style.shortName || 'Model'
  const detail = info.display || info.id || ''
  return (
    <div className={clsx('flex flex-col items-center justify-center rounded-3xl border border-slate-900/10 bg-white/95 px-4 py-4 text-center shadow-sm shadow-slate-900/10 transition dark:border-slate-700/60 dark:bg-slate-900/75 dark:shadow-none', style.shadow)}>
      <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">{shortName}</span>
      <span className={clsx('text-4xl font-black leading-none', style.tone || 'text-slate-900 dark:text-white')}>{value}</span>
      {detail ? (
        <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400" title={detail}>
          {detail}
        </span>
      ) : null}
    </div>
  )
}

function CategoryRow({ categoryId, tally, models }) {
  const meta = QA_ARENA_CATEGORIES[categoryId]
  if (!meta) return null
  const modelAInfo = models?.modelA || {}
  const modelBInfo = models?.modelB || {}
  const labelA = modelAInfo.shortName || 'Model A'
  const labelB = modelBInfo.shortName || 'Model B'
  return (
    <div className={clsx('group relative flex flex-col gap-3 rounded-3xl border border-slate-200/60 bg-white/90 p-4 text-slate-700 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-200')}>
      <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition group-hover:opacity-100">
        <div className={clsx('h-full w-full rounded-3xl bg-gradient-to-r blur-2xl', meta.accentGradient)} />
      </div>
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className={clsx('inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest shadow-sm dark:border-slate-600 dark:bg-slate-800', meta.badgeColor)}>
            {meta.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={clsx('flex items-center gap-1 text-sm font-semibold', MODEL_STYLES.modelA?.accentText || 'text-sky-600')}>
            <span className={clsx('h-2 w-2 rounded-full', MODEL_STYLES.modelA?.dot || 'bg-sky-500')} />
            {labelA} {tally.modelA}
          </span>
          <span className={clsx('flex items-center gap-1 text-sm font-semibold', MODEL_STYLES.modelB?.accentText || 'text-rose-600')}>
            <span className={clsx('h-2 w-2 rounded-full', MODEL_STYLES.modelB?.dot || 'bg-rose-500')} />
            {labelB} {tally.modelB}
          </span>
        </div>
      </div>
      <div className="relative grid grid-cols-2 gap-3 text-sm">
        <div className="flex flex-col rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 text-sky-800 shadow-sm dark:border-sky-400/40 dark:bg-sky-500/15 dark:text-sky-100">
          <span className="text-xs font-semibold uppercase tracking-widest text-sky-600/80 dark:text-sky-200/80">{labelA} streak</span>
          <span className="text-lg font-semibold">{tally.modelA}</span>
        </div>
        <div className="flex flex-col rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-800 shadow-sm dark:border-rose-400/40 dark:bg-rose-500/15 dark:text-rose-100">
          <span className="text-xs font-semibold uppercase tracking-widest text-rose-600/80 dark:text-rose-200/80">{labelB} streak</span>
          <span className="text-lg font-semibold">{tally.modelB}</span>
        </div>
      </div>
    </div>
  )
}

export function QAArenaScoreboard({ scoreboard, models }) {
  const totalA = scoreboard?.total?.modelA ?? 0
  const totalB = scoreboard?.total?.modelB ?? 0
  const categories = scoreboard?.categories ?? {}
  const categoryIds = Object.keys(categories)
  const modelAInfo = models?.modelA || {}
  const modelBInfo = models?.modelB || {}

  return (
    <section className="space-y-6 rounded-3xl border border-slate-900/10 bg-white/95 p-6 text-slate-900 shadow-md shadow-slate-900/15 transition dark:border-slate-700/60 dark:bg-slate-900/75 dark:text-slate-100">
      <header className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-slate-500 dark:text-slate-400">Arena Scoreboard</p>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Total Knockouts</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
            <span className="text-sky-600 dark:text-sky-300">{modelAInfo.display || modelAInfo.id || modelAInfo.shortName || 'Model A'}</span>
            <span className="text-slate-400 dark:text-slate-500">vs</span>
            <span className="text-rose-600 dark:text-rose-300">{modelBInfo.display || modelBInfo.id || modelBInfo.shortName || 'Model B'}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
          <ScorePill modelKey="modelA" value={totalA} models={models} />
          <ScorePill modelKey="modelB" value={totalB} models={models} />
        </div>
      </header>
      <div className="space-y-4">
        {categoryIds.length === 0 ? (
          <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-300">
            <span className="text-base font-semibold text-slate-600 dark:text-slate-100">No matches yet</span>
            <span className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500">Spin up a duel to populate the board.</span>
          </div>
        ) : (
          categoryIds.map((categoryId) => <CategoryRow key={categoryId} categoryId={categoryId} tally={categories[categoryId]} models={models} />)
        )}
      </div>
    </section>
  )
}
