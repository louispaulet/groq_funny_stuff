const toggleButtonBase =
  'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40'
const intensitySelectClass =
  'rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100'

export default function DetailOptionsList({ options, selections, intensityOptions, onToggle, onIntensityChange }) {
  return (
    <div className="space-y-3">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Signature details</span>
      <div className="space-y-2">
        {options.map((option) => {
          const selection = selections[option.id]
          const active = selection?.enabled
          return (
            <div
              key={option.id}
              className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white/70 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-900/40"
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onToggle(option.id)}
                  className={`${toggleButtonBase} ${
                    active
                      ? 'bg-brand-600 text-white shadow hover:bg-brand-500'
                      : 'border border-slate-300 text-slate-600 hover:border-brand-300 hover:text-brand-600 dark:border-slate-600 dark:text-slate-300'
                  }`}
                >
                  {active ? 'Included' : 'Add'}
                </button>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{option.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{option.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Intensity
                </label>
                <select
                  value={selection?.intensity || 'balanced'}
                  onChange={(event) => onIntensityChange(option.id, event.target.value)}
                  className={intensitySelectClass}
                >
                  {intensityOptions.map((intensity) => (
                    <option key={intensity.value} value={intensity.value}>
                      {intensity.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
