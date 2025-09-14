export default function ModelSelector({ value, onChange }) {
  return (
    <label className="block w-64">
      <span className="block text-xs font-medium text-slate-600 dark:text-slate-400">Model</span>
      <select
        className="mt-1 block w-full rounded-md border border-slate-300 bg-white p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      >
        <option value="openai/gpt-oss-20b">openai/gpt-oss-20b</option>
        <option value="openai/gpt-oss-120b">openai/gpt-oss-120b</option>
      </select>
    </label>
  )
}
