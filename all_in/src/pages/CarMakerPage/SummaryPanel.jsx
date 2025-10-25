export default function SummaryPanel({ summary }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 shadow-inner dark:bg-slate-900/40 dark:text-slate-300">
      <p className="font-medium text-slate-700 dark:text-slate-100">Quick summary</p>
      <p className="mt-1 leading-relaxed">{summary}</p>
    </div>
  )
}
