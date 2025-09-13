export default function ModelSelector({ value, onChange }) {
  return (
    <label className="block w-64">
      <span className="block text-xs font-medium text-slate-600">Model</span>
      <select
        className="mt-1 block w-full rounded-md border border-slate-300 bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      >
        <option value="openai/gpt-oss-20b">openai/gpt-oss-20b</option>
        <option value="openai/gpt-oss-120b">openai/gpt-oss-120b</option>
      </select>
    </label>
  )
}

