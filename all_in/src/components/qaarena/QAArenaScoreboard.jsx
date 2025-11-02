import clsx from 'clsx'
import { QA_ARENA_CATEGORIES } from '../../content/qaarenaTopics'

const MODEL_STYLES = {
  modelA: { shortName: 'Model A', tone: 'text-sky-500', accentText: 'text-sky-200', dot: 'bg-sky-400', shadow: 'shadow-[0_0_30px_rgba(56,189,248,0.45)]' },
  modelB: { shortName: 'Model B', tone: 'text-rose-500', accentText: 'text-rose-200', dot: 'bg-rose-400', shadow: 'shadow-[0_0_30px_rgba(244,114,182,0.45)]' },
}

function ScorePill({ modelKey, value, models }) {
  const style = MODEL_STYLES[modelKey] || {}
  const info = models?.[modelKey] || {}
  const shortName = info.shortName || style.shortName || 'Model'
  const detail = info.display || info.id || ''
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-900/70 px-4 py-3 text-center shadow-inner transition',
        'backdrop-blur',
        style.shadow,
      )}
    >
      <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">{shortName}</span>
      <span className={clsx('text-4xl font-black leading-none', style.tone || 'text-white')}>{value}</span>
      {detail ? (
        <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500" title={detail}>
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
    <div
      className={clsx(
        'group relative flex flex-col gap-2 rounded-3xl border border-slate-200/20 bg-slate-900/40 p-4 transition duration-300 ease-out hover:scale-[1.01] hover:border-white/30 hover:shadow-xl dark:border-slate-700/40',
      )}
    >
      <div className="absolute inset-0 rounded-3xl opacity-0 transition group-hover:opacity-100">
        <div className={clsx('h-full w-full rounded-3xl bg-gradient-to-r blur-2xl', meta.accentGradient)} />
      </div>
      <div className="relative flex items-center justify-between gap-4">
        <div>
          <span className={clsx('inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest shadow-sm', meta.badgeColor)}>
            {meta.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-sm font-semibold text-sky-200">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            {labelA} {tally.modelA}
          </span>
          <span className="flex items-center gap-1 text-sm font-semibold text-rose-200">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            {labelB} {tally.modelB}
          </span>
        </div>
      </div>
      <div className="relative grid grid-cols-2 gap-3 text-sm text-slate-300">
        <div className="flex flex-col rounded-2xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-sky-100 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-widest text-sky-200/80">{labelA} streak</span>
          <span className="text-lg font-semibold text-sky-100">{tally.modelA}</span>
        </div>
        <div className="flex flex-col rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-rose-100 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-widest text-rose-200/80">{labelB} streak</span>
          <span className="text-lg font-semibold text-rose-100">{tally.modelB}</span>
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
    <section className="space-y-6 rounded-3xl border border-slate-200/30 bg-slate-900/60 p-6 text-white shadow-2xl shadow-brand-500/10 backdrop-blur-xl dark:border-slate-700/40">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-slate-400">Arena Scoreboard</p>
          <h2 className="text-3xl font-black">Total Knockouts</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
            <span className="text-sky-200">{modelAInfo.display || modelAInfo.id || modelAInfo.shortName || 'Model A'}</span>
            <span className="text-slate-400">vs</span>
            <span className="text-rose-200">{modelBInfo.display || modelBInfo.id || modelBInfo.shortName || 'Model B'}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
          <ScorePill modelKey="modelA" value={totalA} models={models} />
          <ScorePill modelKey="modelB" value={totalB} models={models} />
        </div>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {categoryIds.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-600/60 bg-slate-900/20 p-8 text-center text-sm text-slate-300">
            <span className="text-base font-semibold text-slate-100">No matches yet</span>
            <span className="text-xs uppercase tracking-widest text-slate-500">Spin up a battle to populate the board.</span>
          </div>
        ) : (
          categoryIds.map((categoryId) => (
            <CategoryRow key={categoryId} categoryId={categoryId} tally={categories[categoryId]} models={models} />
          ))
        )}
      </div>
    </section>
  )
}
