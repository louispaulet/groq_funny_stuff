export default function Settings({ baseUrl, setBaseUrl, model, setModel, experience, objectType }) {
  function normalizeBaseUrl(raw) {
    const candidate = (raw || '').trim()
    if (!candidate) return ''
    return candidate.replace(/\/$/, '')
  }
  return (
    <section className="md:col-span-12">
      <div className="rounded-xl border border-slate-200 bg-white/80 p-3 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Service settings</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure model and base URL for object creation.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="block text-sm">
              <span className="block text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Model</span>
              <select
                className="mt-1 block w-56 rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                {(experience?.modelOptions || []).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="block text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Service base URL</span>
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                onBlur={(e) => setBaseUrl(normalizeBaseUrl(e.target.value))}
                className="mt-1 block w-72 rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="https://your-endpoint.example"
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  )
}
