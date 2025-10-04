import { useMemo, useState } from 'react'
import { clearZoo, groupEntriesByType, readZooEntries, writeZooEntries } from '../lib/objectMakerStore'
import { Link } from 'react-router-dom'

function EntryCard({ entry, onDelete }) {
  const [open, setOpen] = useState(false)
  const created = new Date(entry.createdAt)
  return (
    <div className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{entry.title}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{created.toLocaleString()}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/60"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? 'Hide' : 'View'}
          </button>
          <button
            className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>
      {open ? (
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <div>
            <div className="mb-1 text-xs font-semibold text-slate-600 dark:text-slate-300">Result</div>
            <pre className="max-h-72 overflow-auto rounded-md border border-slate-200 bg-slate-50 p-2 text-[12px] text-slate-800 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200">{JSON.stringify(entry.result, null, 2)}</pre>
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold text-slate-600 dark:text-slate-300">Structure</div>
            <pre className="max-h-72 overflow-auto rounded-md border border-slate-200 bg-slate-50 p-2 text-[12px] text-slate-800 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200">{JSON.stringify(entry.structure, null, 2)}</pre>
          </div>
          <div className="lg:col-span-2">
            <div className="mb-1 text-xs font-semibold text-slate-600 dark:text-slate-300">Conversation</div>
            <div className="max-h-56 space-y-2 overflow-auto">
              {(entry.conversation || []).map((m, i) => (
                <div key={i} className={`rounded-md p-2 text-[12px] ${m.role === 'user' ? 'bg-yellow-50 text-slate-800 dark:bg-yellow-500/10' : 'bg-slate-50 text-slate-700 dark:bg-slate-800/50 dark:text-slate-200'}`}>
                  <div className="mb-1 text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{m.role}</div>
                  <div className="whitespace-pre-wrap break-words">{m.content}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function ObjectMakerZoo() {
  const [entries, setEntries] = useState(() => readZooEntries())

  const grouped = useMemo(() => groupEntriesByType(entries), [entries])

  function handleDelete(entry) {
    const next = entries.filter((e) => e !== entry)
    setEntries(next)
    writeZooEntries(next)
  }

  function handleClearAll() {
    clearZoo()
    setEntries([])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">Object Zoo</h3>
        <div className="flex items-center gap-2">
          <Link to="/objectmaker" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/60">Back to Builder</Link>
          {entries.length > 0 ? (
            <button
              onClick={handleClearAll}
              className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
            >
              Delete all saved objects
            </button>
          ) : null}
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white/70 p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
          No entries yet. Create objects in the Builder and they will appear here grouped by type.
        </div>
      ) : null}

      {[...grouped.entries()].map(([type, list]) => (
        <section key={type} className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{type} — {list.length}</h4>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {list.map((entry) => (
              <EntryCard key={entry.id} entry={entry} onDelete={() => handleDelete(entry)} />)
            )}
          </div>
        </section>
      ))}
    </div>
  )
}

