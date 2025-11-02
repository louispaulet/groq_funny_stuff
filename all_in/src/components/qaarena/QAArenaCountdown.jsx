export function QAArenaCountdown({ countdown }) {
  if (!countdown) return null
  const { label, seconds } = countdown
  if (!Number.isFinite(seconds)) return null

  return (
    <div className="relative overflow-hidden rounded-3xl border border-indigo-500/40 bg-slate-900/80 p-4 text-white shadow-lg shadow-indigo-500/10">
      <div className="absolute inset-0 -z-10 animate-pulse bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-sky-500/20 opacity-60" />
      <p className="text-xs font-semibold uppercase tracking-[0.5em] text-indigo-200/80">Cooldown</p>
      <div className="mt-2 flex items-baseline gap-3">
        <span className="text-5xl font-black tabular-nums text-white drop-shadow">{seconds}</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-indigo-100">seconds</p>
          <p className="text-sm text-indigo-200/90">{label}</p>
        </div>
      </div>
    </div>
  )
}
