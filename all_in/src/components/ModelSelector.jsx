export default function ModelSelector({ value, onChange, options = [] }) {
  const models = options.length > 0 ? options : [value]
  return (
    <label className="block text-sm">
      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Model</span>
      <select
        className="mt-1 block w-56 rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      >
        {models.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
    </label>
  )
}
