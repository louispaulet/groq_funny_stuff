export function QAArenaCountdown({ countdown }) {
  const hasCountdown = countdown && Number.isFinite(countdown.seconds)
  const seconds = hasCountdown ? countdown.seconds : null
  const label = hasCountdown ? countdown.label : 'Arena is on standby.'

  return (
    <div className="relative flex min-h-[152px] flex-col justify-between overflow-hidden rounded-3xl border border-slate-900/10 bg-white/95 p-5 text-slate-900 shadow-md shadow-slate-900/10 transition dark:border-slate-700/60 dark:bg-slate-900/80 dark:text-slate-100 dark:shadow-none">
      {hasCountdown ? (
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 dark:from-sky-500/20 dark:via-indigo-500/20 dark:to-purple-500/20" aria-hidden="true" />
      ) : null}
      <p className="text-xs font-semibold uppercase tracking-[0.5em] text-slate-500 dark:text-slate-400">Cooldown</p>
      <div className="mt-3 flex items-end gap-3">
        <span className="text-5xl font-black tabular-nums text-slate-900 dark:text-white">{seconds ?? '—'}</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-600 dark:text-indigo-100">{hasCountdown ? 'seconds' : 'No timer running'}</p>
          <p className="text-sm text-slate-500 dark:text-indigo-200">{label}</p>
        </div>
      </div>
    </div>
  )
}
